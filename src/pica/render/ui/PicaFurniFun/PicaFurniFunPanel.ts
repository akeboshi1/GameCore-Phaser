
import { op_client } from "pixelpai_proto";
import { NineSliceButton, NineSlicePatch, GameScroller, BBCodeText, ClickEvent, Button } from "apowophaserui";
import { AnimationModel, BasePanel, DynamicImage, ItemInfoTips, UiManager } from "gamecoreRender";
import { DetailDisplay } from "picaRender";
import { ModuleName } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Url } from "utils";
import { ICountablePackageItem } from "picaStructure";
export class PicaFurniFunPanel extends BasePanel {
    public static PICAFURNIFUN_SHOW: string = "PICAFURNIFUN_SHOW";
    public confirmBtn: NineSliceButton;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private bgicon: Phaser.GameObjects.Image;
    private titleimage: Phaser.GameObjects.Image;
    private titleName: Phaser.GameObjects.Text;
    private mDetailDisplay: DetailDisplay;
    private materialCon: Phaser.GameObjects.Container;
    private materialGameScroll: GameScroller;
    private content: Phaser.GameObjects.Container;
    private closeBtn: Button;
    private selectMaterial: MaterialItem;
    private itemName: Phaser.GameObjects.Text;
    private itemtips: ItemInfoTips;
    private materials: ICountablePackageItem[];
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAFURNIFUN_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.66);
        this.blackGraphic.fillRect(0, 0, width, height);
        this.content.x = Math.floor(width / 2);
        this.content.y = Math.floor(height / 2);
        this.setSize(width * this.scale, height * this.scale);
        this.materialGameScroll.refreshMask();
    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.setInteractive();
        this.addListen();
        this.setFuritDisplay();
        this.setMaterialsData(this._getMaterialData());
        this.render.emitter.emit(PicaFurniFunPanel.PICAFURNIFUN_SHOW);
    }

    addListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnClick, this);
        this.closeBtn.on(ClickEvent.Tap, this.OnClosePanel, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.off(ClickEvent.Tap, this.onConfirmBtnClick, this);
        this.closeBtn.off(ClickEvent.Tap, this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "furni_unlock/furni_unlock.png", "furni_unlock/furni_unlock.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    init() {
        const width = this.cameraWidth;
        const height = this.cameraHeight;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, height / this.scale), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 295 * this.dpr, bgheight = 400 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasKey.common2Key, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 40 * this.dpr
        });
        this.content.add(this.bg);
        const posY = -this.bg.height * 0.5;
        this.titleimage = this.scene.make.image({ x: 0, y: posY + 5 * this.dpr, key: UIAtlasKey.common2Key, frame: "title" }, false);
        this.titleimage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: this.titleimage.y + 2 * this.dpr, text: i18n.t("furni_unlock.title"),
            style: { color: "#905B06", fontFamily: Font.DEFULT_FONT, fontSize: 16 * this.dpr }
        }).setOrigin(0.5, 0.5).setFontStyle("bold");
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.x = this.bg.width * 0.5 - this.dpr * 8;
        this.closeBtn.y = posY + this.dpr * 7;
        this.content.add([this.titleimage, this.titleName, this.closeBtn]);
        this.itemName = this.scene.make.text({
            x: 0, y: this.titleimage.y + this.titleimage.height * 0.5 + 13 * this.dpr, text: "",
            style: { color: "#FFC51A", fontFamily: Font.DEFULT_FONT, fontSize: 14 * this.dpr }
        }).setFontStyle("bold").setStroke("#996600", 4).setOrigin(0.5);
        this.content.add(this.itemName);
        this.bgicon = this.scene.make.image({ key: this.key, frame: "bg_f" });
        this.bgicon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.bgicon.y = this.itemName.y + this.bgicon.height * 0.5 + 13 * this.dpr;
        this.content.add([this.bg, this.bgicon]);
        this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
        this.mDetailDisplay.setTexture(this.key, "bg_f");
        this.mDetailDisplay.y = this.bgicon.y;// this.bgicon.height / 2;
        this.mDetailDisplay.setFixedScale(this.dpr / this.scale);
        this.mDetailDisplay.setSize(72 * this.dpr, 72 * this.dpr);
        this.content.add(this.mDetailDisplay);
        const materialConWdith = 360 * this.dpr, materialConHeight = 92 * this.dpr;
        this.materialCon = this.scene.make.container(undefined, false).setSize(materialConWdith, materialConHeight);
        this.content.add(this.materialCon);
        this.materialCon.setPosition(0, -posY - materialConHeight * 0.5 - 66 * this.dpr);
        const materialTitle = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 12 * this.dpr,
            text: i18n.t("furni_unlock.needMaterials"),
            style: {
                color: "#253FCA",
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        const materialLine = this.scene.make.image({ key: this.key, frame: "sourcelist_title" });
        materialLine.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const materialLine2 = this.scene.make.image({ key: this.key, frame: "sourcelist_title" });
        materialLine2.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const linePosx = -materialTitle.width * 0.5 - materialLine.width * 0.5 - 10 * this.dpr;
        materialLine.setPosition(linePosx, materialTitle.y);
        materialLine2.setPosition(-linePosx, materialTitle.y).rotation = -Math.PI;
        this.materialCon.add([materialTitle, materialLine, materialLine2]);
        this.materialGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 2 * this.dpr,
            width: 240 * this.dpr,
            height: 90 * this.dpr,
            zoom: this.scale,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 20 * this.dpr,
            valuechangeCallback: undefined,
            cellupCallBack: (gameobject) => {
                this.onMaterialItemHandler(gameobject);
            }
        });
        this.materialCon.add(this.materialGameScroll);
        const tipsWidth = 145 * this.dpr;
        const tipsHeight = 55 * this.dpr;
        this.itemtips = new ItemInfoTips(this.scene, tipsWidth, tipsHeight, UIAtlasKey.common2Key, "tips_bg", this.dpr, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.itemtips.x = -this.width * 0.5 + tipsWidth * 0.5 + 10 * this.dpr;
        this.itemtips.y = -this.height * 0.5 + 70 * this.dpr;
        this.itemtips.setVisible(false);
        this.itemtips.setHandler(new Handler(this, this.onItemTipsHideHandler));
        this.content.add(this.itemtips);
        this.confirmBtn = new NineSliceButton(this.scene, 0, -posY - 35 * this.dpr, 100 * this.dpr, 40 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_over", i18n.t("furni_unlock.unlock"), this.dpr, this.scale, {
            left: 15 * this.dpr,
            top: 15 * this.dpr,
            right: 15 * this.dpr,
            bottom: 15 * this.dpr
        });
        this.confirmBtn.setTextStyle({
            color: "#976400",
            fontSize: 12 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            stroke: "#976400",
        });
        this.confirmBtn.setTextOffset(10 * this.dpr, 0);
        const repairicon = this.scene.make.image({ key: this.key, frame: "repair_icon" });
        repairicon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        repairicon.x = -28 * this.dpr;
        this.confirmBtn.add(repairicon);
        this.content.add(this.confirmBtn);
        this.resize(0, 0);
        super.init();
    }

    destroy() {
        this.removeListen();
        if (this.confirmBtn) this.confirmBtn.destroy();
        this.confirmBtn = null;
        super.destroy();
    }

    setFuritDisplay() {
        const sprite = this._getDisplayData();
        const display = sprite.displayInfo;
        const resData = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE();
        resData.display = display.display;
        const animas = this.createProtocolObject(display.animations);
        if (animas.length > 1) {
            const arr = [];
            for (const ani of animas) {
                if (ani.node.name !== "lock") {
                    ani.frameName = ani.layer[0].frameName;
                    arr.push(ani);
                }
            }
            if (arr.length === 0) arr.push(animas[0]);
            resData.animations = arr;
        } else {
            resData.animations = animas;
        }
        this.mDetailDisplay.loadDisplay(resData);
        this.itemName.text = sprite.nickname;
    }

    isTeamBuild() {
        return this.mShowData.tag && this.mShowData.tag === "teambuild";
    }

    _getDisplayData() {
        if (this.isTeamBuild()) {
            return this.mShowData.element;
        } else {
            return this.mShowData;
        }
    }

    _getMaterialData() {
        if (this.isTeamBuild()) {
            return this.mShowData.materials;
        } else {
            return this.materials;
        }
    }

    setMaterialsData(materials: ICountablePackageItem[]) {
        this.materials = materials;
        if (!this.mInitialized || !materials) return;
        this.setMaterialItems(this.materials);
    }

    private createProtocolObject(animations: Map<string, any>): any[] {
        const anis: any[] = [];
        animations.forEach((model: AnimationModel) => {
            const modelData: any = { node: model["mNode"], baseLoc: "0,0", originPoint: [0, 0], layer: [] };
            const animodel = new AnimationModel(modelData);
            Object.assign(animodel, model);
            const ani = animodel.createProtocolObject();
            anis.push(ani);
        }, this);
        return anis;
    }

    private setMaterialItems(datas: ICountablePackageItem[]) {
        const len = datas.length;
        (<any>this.materialGameScroll).clearItems();
        for (let i = 0; i < len; i++) {
            const item = new MaterialItem(this.scene, this.key, this.dpr, this.scale);
            item.y = 0;
            item.setItemData(datas[i]);
            item.setData("itemData", datas[i]);
            this.materialGameScroll.addItem(item);
        }
        this.materialGameScroll.Sort();
        // this.onMaterialItemHandler(datas[0]);
    }

    private onConfirmBtnClick() {
        const data = this.showData;
        if (!data) return;
        if (this.isTeamBuild()) {
            this.render.renderEmitter(this.key + "_queryTeamBuild", [data.element.id]);
        } else {
            this.render.renderEmitter(this.key + "_queryunlock", [data.id]);
        }
        this.OnClosePanel();
    }
    private OnClosePanel() {
        this.render.renderEmitter(this.key + "_close");
    }

    private onMaterialItemHandler(gameobject: MaterialItem) {
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
        while (tempobject.parentContainer !== this.content) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.itemtips.width * 0.5 < -this.content.width * 0.5) {
            this.itemtips.x = this.itemtips.width * 0.5 - this.content.width * 0.5 + 20 * this.dpr;
        } else if (posx + this.itemtips.width * 0.5 > this.content.width * 0.5) {
            this.itemtips.x = this.content.width * 0.5 - this.itemtips.width * 0.5 - 20 * this.dpr;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy - this.itemtips.height * 0.5 + 5 * this.dpr;
    }
}

class MaterialItem extends Phaser.GameObjects.Container {
    public itemData: ICountablePackageItem;
    private readonly dpr: number;
    private readonly key: string;
    private zoom: number;
    private itemIcon: DynamicImage;
    private itemCount: BBCodeText;
    private bg: Phaser.GameObjects.Image;
    private mselect: boolean = false;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: this.key, frame: "bg_m" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemIcon.scale = this.dpr / this.zoom;
        this.itemCount = new BBCodeText(this.scene, 0, 15 * dpr, "10/20", { color: "#000000" })
            .setOrigin(0.5).setFontSize(11 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.add([this.bg, this.itemIcon, this.itemCount]);
        this.setSize(this.bg.width, this.bg.height);
        this.itemCount.y = this.height * 0.5 + 8 * dpr;
    }
    public setItemData(data: ICountablePackageItem) {
        this.itemData = data;
        this.itemCount.text = this.getCountText(data);
        const url = Url.getOsdRes(data.texturePath);
        this.itemIcon.load(url, this, () => {
        });
    }

    public set select(value: boolean) {
        this.bg.setFrame(value ? "bg_select" : "bg_m");
        this.mselect = value;
    }
    public get select() {
        return this.mselect;
    }
    private getCountText(data: ICountablePackageItem) {
        const color = (data.count >= data.neededCount ? "#000000" : "#ff0000");
        const text = `[color=${color}]${data.count}[/color]/` + data.neededCount;
        // if (data.hasOwnProperty("recommended")) {
        //     text = data.recommended + "/" + text;
        // }
        return text;
    }
}
