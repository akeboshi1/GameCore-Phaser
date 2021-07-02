import { ButtonEventDispatcher } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { UIHelper } from "utils";

export class BackTextButton extends ButtonEventDispatcher {
    private titleTex: Phaser.GameObjects.Text;
    private closeImg: Phaser.GameObjects.Image;
    private originWidth: number;
    private originHeight: number;
    private style?: any;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, style?: any) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.originWidth = width;
        this.originHeight = height;
        this.style = style || UIHelper.whiteStyle(this.dpr, 16);
        this.init();
    }
    public setText(text: string) {
        this.titleTex.text = text;
        this.resetSize();
    }
    public setTextStyle(style: any) {
        this.titleTex.setStyle(style);
    }
    public setFontStyle(style: string = "bold") {
        this.titleTex.setFontStyle(style);
    }
    protected init() {

        this.setSize(this.originWidth, this.originHeight);
        this.enable = true;
        this.closeImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "back_arrow" });
        this.closeImg.x = -this.width * 0.5 + this.closeImg.width * 0.5 + 10 * this.dpr;
        this.titleTex = this.scene.make.text({ text: "", style: this.style }).setOrigin(0, 0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.x = this.closeImg.x + this.closeImg.width * 0.5 + 10 * this.dpr;
        this.titleTex = this.titleTex;
        this.add([this.closeImg, this.titleTex]);
        this.resetSize();
    }

    protected resetSize() {
        let width = this.closeImg.width + this.titleTex.width + 30 * this.dpr;
        width = width < this.originWidth ? this.originWidth : width;
        this.setSize(width, this.originHeight);
        this.closeImg.x = -this.width * 0.5 + this.closeImg.width * 0.5 + 15 * this.dpr;
        this.titleTex.x = this.closeImg.x + this.closeImg.width * 0.5 + 15 * this.dpr;
    }
}
