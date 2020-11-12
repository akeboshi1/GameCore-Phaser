import { BBCodeText, Button, NineSliceButton, NineSlicePatch, ClickEvent, InputText } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
import { Render } from "../../render";
import { BasePanel } from "./base.panel";

export class InputView extends BasePanel {
    private mTitleLabel: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private border: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private mInput: InputText;
    constructor(scene: Phaser.Scene, render: Render) {
        super(scene, render);
    }

    show(param: IViewConfig) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mWorld.uiManager.getUILayerManager().addToDialogLayer(this);
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width / 2;
        this.content.y = height / 2;
        super.resize(w, h);
        this.border.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    }

    protected preload() {
        this.addAtlas(UIAtlasKey.common3Key, UIAtlasName.textureUrl(UIAtlasName.common3Url), UIAtlasName.jsonUrl(UIAtlasName.common3Url));
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.textureUrl(UIAtlasName.commonUrl), UIAtlasName.jsonUrl(UIAtlasName.commonUrl));
        super.preload();
    }

    protected init() {
        const { width, height } = this.scene.cameras.main;
        const border = this.scene.make.graphics(undefined, false);
        border.fillStyle(0, 0.6);
        border.fillRect(0, 0, width, height);
        this.add(border);
        this.border = border;
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        const background = this.scene.make.image({ key: UIAtlasKey.common3Key, frame: "bg_universal_box" });
        this.content.add(background);
        this.content.setSize(background.width, background.height);
        this.closeBtn = new Button(this.scene, this.key, "close");
        this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
        this.closeBtn.setPosition(this.content.width * 0.5 - 5 * this.dpr, -this.content.height * 0.5 + this.dpr * 4);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.add(this.closeBtn);
        const title = this.scene.make.image({
            y: -background.height / 2,
            key: UIAtlasKey.common3Key,
            frame: "title"
        });
        title.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.content.add(title);
        this.mTitleLabel = this.scene.make.text({
            y: title.y - 6 * this.dpr,
            style: {
                fontFamily: Font.DEFULT_FONT,
                fontSize: 19 * this.dpr,
                color: "#905B06"
            }
        }, false).setOrigin(0.5);
        this.content.add(this.mTitleLabel);
        const btn = new NineSliceButton(this.mScene, 0, 0, 181 * this.dpr, 45 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal", i18n.t("common.editnow"), this.dpr, this.scale, UIHelper.button(this.dpr));
        btn.setTextStyle(UIHelper.brownishStyle(this.dpr, 21));
        btn.setFontStyle("bold");
        btn.y = this.content.height * 0.5 - btn.height * 0.5 - 20 * this.dpr;
        btn.on(ClickEvent.Tap, this.onClickHandler, this);
        this.content.add(btn);
        this.mInput = this.createInput(0, -30 * this.dpr, 279 * this.dpr, 52 * this.dpr, 17 * this.dpr);
        this.mInput.on("textchange", this.onTextChangeHandler, this);
        super.init();
        this.resize(width, height);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    }

    private createInput(x: number, y: number, width: number, height: number, font: number, type: string = "text") {
        const mblackbg = this.scene.make.graphics(undefined, false);
        mblackbg.fillStyle(0xA4EFF3, 0.66);
        mblackbg.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, 6 * this.dpr);
        mblackbg.setPosition(x, y);
        this.content.add(mblackbg);
        const input = new InputText(this.scene, x, y, width - 20 * this.dpr, height - 10 * this.dpr, {
            type,
            placeholder: this.showData.placeholder,
            color: "#055C62",
            fontSize: font + "px"
        });
        this.content.add(input);
        return input;
    }

    private onClickHandler() {
        const text = this.mInput.text;
        const handler: Handler = this.showData.handler;
        if (handler) handler.runWith(text);
        this.onCloseHandler();
    }

    private onCloseHandler() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
            this.destroy();
        }
        if (!this.mShowData || this.mShowData.once !== false) {
            this.destroy();
            this.mShowData = undefined;
        }
    }
    private onTextChangeHandler() {
        const length = this.showData.length;
        if (!length) return;
        const len = this.mInput.text.length;
        if (Font.fontSzie(13 * this.dpr, this.mInput.text) > length) {
            this.mInput.text = this.mInput.text.slice(0, len - 2);
        }
    }
}
interface IViewConfig {
    placeholder?: string;
    title?: string;
    handler?: Handler;
    ox?: number;
    oy?: number;
    once?: boolean;
    length?: number;
}
