
import { op_client } from "pixelpai_proto";
import { NineSlicePatch, GameScroller, BBCodeText, ClickEvent, Button } from "apowophaserui";
import { DetailDisplay } from "picaRender";
import { ItemInfoTips, MaterialItem, Render } from "gamecoreRender";
import { Font, Handler, i18n, UIHelper } from "utils";
import { UIAtlasKey } from "picaRes";
export class PicaTreasurePreviewPanel extends Phaser.GameObjects.Container {
    private confirmBtn: Button;
    private bg: NineSlicePatch;
    private bgicon: Phaser.GameObjects.Image;
    private titleimage: Phaser.GameObjects.Image;
    private titleName: Phaser.GameObjects.Text;
    private mDetailDisplay: DetailDisplay;
    private rewardCon: Phaser.GameObjects.Container;
    private rewardGameScroll: GameScroller;
    private closeBtn: Button;
    private selectMaterial: MaterialItem;
    private itemtips: ItemInfoTips;
    private dpr: number;
    private zoom: number;
    private key: string;
    private treasureData: any;
    private closeHandler: Handler;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, protected render: Render, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        this.setSize(width, height);
        this.init();
    }

    resize(w: number, h: number) {
        this.setSize(w, h);
        this.rewardGameScroll.refreshMask();
    }

    addListen() {
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnClick, this);
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    removeListen() {
        this.confirmBtn.off("click", this.onConfirmBtnClick, this);
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }
    init() {

        this.bg = new NineSlicePatch(this.scene, 0, 0, this.width, this.height, UIAtlasKey.common3Key, "bg", UIHelper.background_w(this.dpr));
        this.add(this.bg);
        const posY = -this.bg.height * 0.5;
        this.titleimage = this.scene.make.image({ x: 0, y: posY + 5 * this.dpr, key: UIAtlasKey.common3Key, frame: "title" }, false);
        this.titleimage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: this.titleimage.y + 2 * this.dpr, text: "",
            style: UIHelper.titleYellowStyle_m(this.dpr)
        }).setOrigin(0.5).setFontStyle("bold");
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
        this.closeBtn.setPosition(this.width * 0.5 - 8 * this.dpr, posY + this.dpr * 7);
        this.add([this.titleimage, this.titleName, this.closeBtn]);
        this.bgicon = this.scene.make.image({ key: this.key, frame: "treasure_bg" });
        this.bgicon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.bgicon.y = this.titleName.y + this.bgicon.height * 0.5 + 34 * this.dpr;
        this.add([this.bg, this.bgicon]);
        this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
        this.mDetailDisplay.y = this.bgicon.y;
        this.mDetailDisplay.setFixedScale(this.dpr / this.scale);
        this.mDetailDisplay.setSize(72 * this.dpr, 72 * this.dpr);
        this.add(this.mDetailDisplay);
        const rewardConWdith = 360 * this.dpr, rewardConHeight = 92 * this.dpr;
        this.rewardCon = this.scene.make.container(undefined, false).setSize(rewardConWdith, rewardConHeight);
        this.add(this.rewardCon);
        this.rewardCon.setPosition(0, -posY - rewardConHeight * 0.5 - 68 * this.dpr);
        const rewardTitle = this.scene.make.text({
            x: 0,
            y: -rewardConHeight * 0.5 + 8 * this.dpr,
            text: i18n.t("treasure.tipslabel"),
            style: {
                color: "#253FCA",
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        const materialLine = this.scene.make.image({ key: this.key, frame: "treasure_decorate_left" });
        materialLine.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const materialLine2 = this.scene.make.image({ key: this.key, frame: "treasure_decorate_right" });
        materialLine2.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const linePosx = -rewardTitle.width * 0.5 - materialLine.width * 0.5 - 10 * this.dpr;
        materialLine.setPosition(linePosx, rewardTitle.y);
        materialLine2.setPosition(-linePosx, rewardTitle.y);
        this.rewardCon.add([rewardTitle, materialLine, materialLine2]);
        this.rewardGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 2 * this.dpr,
            width: 295 * this.dpr,
            height: 90 * this.dpr,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 10 * this.dpr,
            valuechangeCallback: undefined,
            cellupCallBack: (gameobject) => {
                this.onRewardItemHandler(gameobject);
            }
        });
        this.rewardCon.add(this.rewardGameScroll);
        const tipsWidth = 145 * this.dpr;
        const tipsHeight = 55 * this.dpr;
        this.itemtips = new ItemInfoTips(this.scene, tipsWidth, tipsHeight, UIAtlasKey.common3Key, "tips_bg", this.dpr, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.itemtips.x = -this.width * 0.5 + tipsWidth * 0.5 + 10 * this.dpr;
        this.itemtips.y = -this.height * 0.5 + 70 * this.dpr;
        this.itemtips.setVisible(false);
        this.itemtips.setHandler(new Handler(this, this.onItemTipsHideHandler));
        this.add(this.itemtips);
        this.confirmBtn = new Button(this.scene, this.key, "butt", "butt", i18n.t("common.open"));
        this.confirmBtn.y = -posY - 38 * this.dpr;
        this.confirmBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 20));
        this.confirmBtn.setFontStyle("bold");
        this.add(this.confirmBtn);
    }

    setHandler(send: Handler, close: Handler) {
        this.sendHandler = send;
        this.closeHandler = close;
    }
    setTreasureData(datas: any) {
        // const display = this.getDisplayInfo(undefined);
        // this.mDetailDisplay.loadDisplay(display);
        this.titleName.text = "某某某宝箱";
        this.setTreasureItems(datas);
    }

    // private getDisplayInfo(isprite: any) {
    //     const display = isprite.displayInfo;
    //     const resData = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE();
    //     resData.display = display.display;
    //     const animas = display.createProtocolObject();
    //     if (animas.length > 1) {
    //         const arr = [];
    //         for (const ani of animas) {
    //             if (ani.node.name !== "lock") {
    //                 ani.frameName = ani.layer[0].frameName;
    //                 arr.push(ani);
    //             }
    //         }
    //         if (arr.length === 0) arr.push(animas[0]);
    //         resData.animations = arr;
    //     } else {
    //         resData.animations = animas;
    //     }
    //     return resData;
    // }

    private setTreasureItems(datas: op_client.ICountablePackageItem[]) {
        const len = 10;// datas.length;
        (<any>this.rewardGameScroll).clearItems();
        for (let i = 0; i < len; i++) {
            const item = new MaterialItem(this.scene, UIAtlasKey.common3Key, "material_unchecked", "material_unchecked", this.dpr, this.zoom);
            item.y = 0;
            // item.setItemData(datas[i]);
            // item.setData("itemData", datas[i]);
            this.rewardGameScroll.addItem(item);
        }
        this.rewardGameScroll.Sort();
    }

    private onConfirmBtnClick() {
        const data = this.treasureData;
        if (this.sendHandler) this.sendHandler.run();
    }
    private OnClosePanel() {
        if (this.closeHandler) this.closeHandler.run();
    }

    private onRewardItemHandler(gameobject: MaterialItem) {
        this.itemtips.setVisible(false);
        if (this.selectMaterial && this.selectMaterial !== gameobject) {
            this.selectMaterial.select = false;
        }
        gameobject.select = !gameobject.select;
        if (gameobject.select) {
            this.itemtips.setItemData(gameobject.itemData);
            this.itemtips.setVisible(true);
        }
        this.selectMaterial = gameobject;
        this.setTipsPosition(gameobject);
    }

    private onItemTipsHideHandler() {
        if (this.selectMaterial) this.selectMaterial.select = false;
    }

    private setTipsPosition(gameobject: MaterialItem) {
        let posx: number = gameobject.x;
        let posy: number = gameobject.y;
        let tempobject = <Phaser.GameObjects.Container>gameobject;
        while (tempobject.parentContainer !== this) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.itemtips.width * 0.5 < -this.width * 0.5) {
            this.itemtips.x = this.itemtips.width * 0.5 - this.width * 0.5 + 20 * this.dpr;
        } else if (posx + this.itemtips.width * 0.5 > this.width * 0.5) {
            this.itemtips.x = this.width * 0.5 - this.itemtips.width * 0.5 - 20 * this.dpr;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy - this.itemtips.height * 0.5 + 5 * this.dpr;
    }
}
