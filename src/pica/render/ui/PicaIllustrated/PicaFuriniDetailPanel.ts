import { DetailDisplay } from "../Components/detail.display";
import { NineSliceButton, GameSlider, NineSlicePatch, ClickEvent, Button } from "apowophaserui";
import { ModuleName, RENDER_PEER } from "structure";
import { Coin, Font, Handler, i18n, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem, IExtendCountablePackageItem } from "picaStructure";
import { ProgressMaskBar, Render } from "gamecoreRender";
export class PicaFuriniDetailPanel extends Phaser.GameObjects.Container {
    private backgrand: Phaser.GameObjects.Graphics;
    private codeName: Phaser.GameObjects.Text;
    private titleName: Phaser.GameObjects.Text;
    private mDetailDisplay: DetailDisplay;
    private itemData: ICountablePackageItem;
    private starImg: Phaser.GameObjects.Image;
    private bottomBg: Phaser.GameObjects.Graphics;
    private furinName: Phaser.GameObjects.Text;
    private furiDes: Phaser.GameObjects.Text;
    private closeButton: Button;
    private dpr: number;
    private zoom: number;
    private render: Render;
    private send: Handler;
    constructor(scene: Phaser.Scene, render: Render, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.render = render;
        this.setInteractive();
        this.init();
    }

    resize(w: number, h: number) {
        w = w || this.width;
        h = h || this.height;
        this.setSize(w, h);
    }

    init() {
        this.backgrand = this.scene.make.graphics(undefined, false);
        this.backgrand.fillStyle(0x000000, 0.66);
        this.backgrand.fillRect(-this.width * 0.75, -this.height * 0.75, this.width * 1.5, this.height * 1.5);
        const bg = new NineSlicePatch(this.scene, 0, 0, this.width, this.height, UIAtlasName.uicommon1, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 30 * this.dpr,
            bottom: 40 * this.dpr
        });
        this.closeButton = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.closeButton.x = this.width * 0.5 - this.closeButton.width * 0.5 + 10 * this.dpr;
        this.closeButton.y = -this.height * 0.5 + this.closeButton.height * 0.5 + 10 * this.dpr;
        this.closeButton.on(ClickEvent.Tap, this.onCloseHandler, this);
        const posY = -bg.height * 0.5 + 3 * this.dpr;
        const titlebg = this.scene.make.image({ x: 0, y: posY, key: UIAtlasName.uicommon1, frame: "title" });
        titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: posY + 3 * this.dpr, text: i18n.t("illustrate.furindetail"),
            style: UIHelper.colorStyle("#905B06", this.dpr * 16)
        }, false).setOrigin(0.5);
        this.titleName.setFontStyle("bold");
        this.codeName = this.scene.make.text({
            x: this.width * 0.5 - 10 * this.dpr, y: posY + 40 * this.dpr,
            style: UIHelper.colorStyle("#205BBC", this.dpr * 12)
        }, false).setOrigin(1, 0.5);
        this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
        this.mDetailDisplay.setFixedScale(this.dpr / this.scale);
        this.mDetailDisplay.y = -20 * this.dpr;
        this.starImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_star_big_1" });
        this.starImg.y = 30 * this.dpr;
        this.bottomBg = this.scene.make.graphics(undefined, false);
        this.bottomBg.clear();
        this.bottomBg.fillStyle(0x52D1FF, 1);
        const bottomWidth = 293 * this.dpr, bottomHeight = 78 * this.dpr;
        this.bottomBg.fillRoundedRect(-bottomWidth * 0.5, -bottomHeight * 0.5, bottomWidth, bottomHeight);
        this.bottomBg.y = this.starImg.y + bottomHeight * 0.5 + 30 * this.dpr;
        this.furinName = this.scene.make.text({ style: UIHelper.colorStyle("#205BBC", 15 * this.dpr) }).setOrigin(0, 0.5);
        this.furinName.x = -bottomWidth * 0.5 + 10 * this.dpr;
        this.furinName.y = this.bottomBg.y - bottomHeight * 0.5 + 10 * this.dpr;
        this.furiDes = this.scene.make.text({ style: UIHelper.colorStyle("#000000", 11 * this.dpr) }).setOrigin(0, 0.5);
        this.furiDes.x = this.furinName.x;
        this.furiDes.y = this.furinName.y + 20 * this.dpr;
        this.add([this.backgrand, bg, titlebg, this.titleName, this.closeButton, this.codeName, this.mDetailDisplay, this.starImg, this.bottomBg, this.furinName, this.furiDes]);
        this.resize(0, 0);
    }

    destroy() {
        super.destroy();
    }

    public setProp(prop: IExtendCountablePackageItem) {// PicPropFunConfig
        this.itemData = prop;
        this.codeName.text = prop.code;
        this.furinName.text = prop.name;
        this.furiDes.text = prop.des;
        this.starImg.setFrame("bag_star_big_" + prop.grade);
        this.setResource(prop);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    private setResource(prop: IExtendCountablePackageItem) {
        const content: any = {};
        content.display = prop.animationDisplay || prop.display;
        content.animations = <any>prop.animations;
        if (content.display) {
            this.mDetailDisplay.loadDisplay(content);
        } else if (content.avatar) {
            this.mDetailDisplay.loadAvatar(content, 2, new Phaser.Geom.Point(0, 35 * 2));
        } else {
            this.mDetailDisplay.loadUrl(this.itemData.texturePath);
        }
    }

    private onCloseHandler() {
        if (this.send) this.send.run();
    }

}