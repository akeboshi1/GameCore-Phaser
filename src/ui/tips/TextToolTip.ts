import { NinePatch, BBCodeText } from "@apowo/phaserui";
import { Font } from "../../utils/font";
export class TextToolTips extends Phaser.GameObjects.Container {
    private bg: NinePatch;
    private text: BBCodeText;
    private timeID: any;
    private dpr: number;
    constructor(scene: Phaser.Scene, key: string, frame: string, dpr: number, zoom: number) {
        super(scene);
        const tempframe = scene.textures.getFrame(key, frame);
        const tipsWidth = tempframe.width;
        const tipsHeight = tempframe.height;
        this.dpr = dpr;
        this.bg = new NinePatch(this.scene, 0, 0, tipsWidth, tipsHeight, key, frame, undefined, undefined, {
            left: 20 * dpr,
            top: 20 * dpr,
            right: 20 * dpr,
            bottom: 20 * dpr
        });
        this.text = new BBCodeText(this.scene, 0, 0, "蓝矿石", {
            color: "#333333",
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            wrap: {
                width: 90 * this.dpr,
                mode: "string"
            }
        }).setOrigin(0);
        this.add([this.bg, this.text]);
        this.setSize(tipsWidth + 20 * dpr, tipsHeight + 20 * dpr);
    }

    public setSize(width: number, height: number) {
        super.setSize(width, height);
        this.bg.resize(width, height);
        this.bg.setPosition(0, 0);
        const textWidth = width - 16 * this.dpr;
        const textHeight = height - 16 * this.dpr;
        this.text.setSize(textWidth, textHeight);
        this.text.setWrapWidth(textWidth);
        this.text.x = -textWidth * 0.5;
        this.text.y = -textHeight * 0.5;
        // this.text.setPosition(-textWidth * 0.5, -textHeight * 0.5);
        return this;
    }

    public setText(text: string) {
        this.text.text = text;
        if (this.text.height > this.height) {
            this.setSize(this.width, this.text.height + 16 * this.dpr);
        }
    }

    public setTextData(text: string, delay: number) {
        this.visible = true;
        this.setText(text);
        if (this.timeID) clearTimeout(this.timeID);
        this.timeID = setTimeout(() => {
            this.visible = false;
        }, delay);
    }
}
