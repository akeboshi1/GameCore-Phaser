import { NineSlicePatch, Button, ClickEvent, NineSliceButton, GameScroller } from "apowophaserui";
import { Coin, Handler, i18n, UIHelper, Url } from "utils";
import { ButtonEventDispatcher, DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ImageValue, ItemButton } from "../Components";
import { ICountablePackageItem, IFameLevel, IPermission, IPrice } from "picaStructure";

export class PicaPrivilegeDescriblePanel extends ButtonEventDispatcher {
    protected mBackGround: Phaser.GameObjects.Graphics;
    protected content: Phaser.GameObjects.Container;
    protected bg: NineSlicePatch;
    protected titleText: Phaser.GameObjects.Text;
    private titlebg: Phaser.GameObjects.Image;
    private closeBtn: Button;
    private labelTips: Phaser.GameObjects.Text;
    private prestigeLev: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private privilegeTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, dpr, zoom, false);
        this.setSize(width, height);
        this.init();
    }
    resize(width: number, height: number) {
        const w: number = width;
        const h: number = height;
        super.resize(width, height);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.8);
        this.mBackGround.fillRect(-w * 0.5, -h * 0.5, w, h);
        this.content.x = 0;
        this.content.y = 0;
        this.enable = true;
    }
    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
    public setPrestigeData(data: IFameLevel) {
        const permission: IPermission = data.permission;
        this.prestigeLev.text = i18n.t("prestige.level") + data.level;
        this.labelTips.text = permission.name;
        const url = Url.getOsdRes(permission.texturePath);
        this.icon.load(url);
        this.privilegeTex.text = permission.des;
    }

    protected init() {
        const width = this.width;
        const height = this.height;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.mBackGround.on("pointerup", this.onCloseHandler, this);
        const conWidth = 334 * this.dpr, conHeight = 353 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        this.add([this.mBackGround, this.content]);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWidth, conHeight, UIAtlasName.uicommon1, "bg", {
            left: 70 * this.dpr,
            top: 30 * this.dpr,
            right: 30 * this.dpr,
            bottom: 70 * this.dpr
        });
        this.bg.setInteractive();
        const posY = -conHeight * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon1, frame: "title" });
        this.titlebg.y = posY + 5 * this.dpr;
        this.titleText = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("prestige.permissiontitle"), style: UIHelper.colorStyle("#905C06", 18 * this.dpr) }).setOrigin(0.5);
        this.titleText.setFontStyle("bold");
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.closeBtn.setPosition(conWidth * 0.5 - 7 * this.dpr, posY + this.dpr * 7);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.prestigeLev = this.scene.make.text({ text: i18n.t("prestige.level"), style: UIHelper.colorStyle("#4A87E4", 16 * this.dpr) }).setOrigin(0.5);
        this.prestigeLev.setFontFamily("bold");
        this.prestigeLev.y = -conHeight * 0.5 + 55 * this.dpr;
        this.icon = new DynamicImage(this.scene, 0, 0, UIAtlasName.prestige, "prestige_privilege_clothe_icon");
        this.icon.y = this.prestigeLev.y + this.icon.height * 0.5 + 30 * this.dpr;
        this.labelTips = this.scene.make.text({ text: "", style: UIHelper.colorStyle("#010101", 16 * this.dpr) }).setOrigin(0.5);
        this.labelTips.y = this.icon.y + 60 * this.dpr;
        this.privilegeTex = this.scene.make.text({ text: "", style: UIHelper.blackStyle(this.dpr, 12) }).setOrigin(0);
        this.privilegeTex.setColor("#1F60C4");
        this.privilegeTex.x = -conWidth * 0.5 + 33 * this.dpr;
        this.privilegeTex.setWordWrapWidth(264 * this.dpr, true);
        this.privilegeTex.y = this.labelTips.y + 50 * this.dpr;
        this.content.add([this.bg, this.titlebg, this.titleText, this.closeBtn, this.prestigeLev, this.labelTips, this.icon, this.privilegeTex]);
        this.resize(width, height);
    }

    private onCloseHandler() {
        this.hide();
    }
}
