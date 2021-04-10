
import { op_client } from "pixelpai_proto";
import { NineSlicePatch, GameScroller, ClickEvent, Button } from "apowophaserui";
import { DetailDisplay } from "picaRender";
import { Render } from "gamecoreRender";
import { Font, Handler, i18n, UIHelper } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ItemButton } from "../Components";
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
    private selectMaterial: ItemButton;
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

        this.bg = new NineSlicePatch(this.scene, 0, 0, this.width, this.height, UIAtlasName.uicommon1, "bg1", UIHelper.background_w(this.dpr));
        this.add(this.bg);
        const posY = -this.bg.height * 0.5;
        this.titleimage = this.scene.make.image({ x: 0, y: posY + 5 * this.dpr, key: UIAtlasName.uicommon1, frame: "title" }, false);
        this.titleimage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: this.titleimage.y + 2 * this.dpr, text: "",
            style: UIHelper.titleYellowStyle_m(this.dpr)
        }).setOrigin(0.5).setFontStyle("bold");
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
        this.closeBtn.setPosition(this.width * 0.5 - 8 * this.dpr, posY + this.dpr * 7);
        this.add([this.titleimage, this.titleName, this.closeBtn]);
        this.bgicon = this.scene.make.image({ key: UIAtlasName.treasure, frame: "treasure_bg" });
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
        const materialLine = this.scene.make.image({ key: UIAtlasName.treasure, frame: "treasure_decorate_left" });
        materialLine.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const materialLine2 = this.scene.make.image({ key: UIAtlasName.treasure, frame: "treasure_decorate_right" });
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
        this.confirmBtn = new Button(this.scene, UIAtlasName.treasure, "butt", "butt", i18n.t("common.open"));
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
        this.titleName.text = "某某某宝箱";
        this.setTreasureItems(datas);
    }

    private setTreasureItems(datas: op_client.ICountablePackageItem[]) {
        const len = 10;// datas.length;
        (<any>this.rewardGameScroll).clearItems();
        for (let i = 0; i < len; i++) {
            const item = new ItemButton(this.scene, UIAtlasName.uicommon, "bag_icon_common_bg", this.dpr, this.zoom, false);
            item.y = 0;
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

    private onRewardItemHandler(gameobject: ItemButton) {
        if (this.selectMaterial && this.selectMaterial !== gameobject) {
            this.selectMaterial.select = false;
        }
        gameobject.select = !gameobject.select;

        this.selectMaterial = gameobject;
    }
}
