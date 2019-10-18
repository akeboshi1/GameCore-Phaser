import { Tool } from "../../utils/tool";
import { IToolTip } from "./itoolTip";

export class ToolTip extends Phaser.GameObjects.Container implements IToolTip {

    private static TOP: string = "tip_top.png";
    private static MID: string = "tip_mid.png";
    private static BOT: string = "tip_bot.png";
    private mWidth: number = 0;
    private mHeight: number = 0;
    private mBaseMidHeight: number = 0;

    private topImage: Phaser.GameObjects.Image;
    private midImage: Phaser.GameObjects.Image;
    private botImage: Phaser.GameObjects.Image;
    private mText: Phaser.GameObjects.Text;
    constructor(private mScene: Phaser.Scene, private resStr: string, private resJson: string, private resUrl: string) {
        super(mScene);
        this.preLoad();
    }

    public setToolTipData(value: string) {
        if (!this.mText) return;
        const str = Tool.formatChineseString(value, this.mText.style.fontSize, this.mWidth - 20);
        this.mText.setText(str);
        this.refreshTip();
    }

    public destroy() {
        if (this.topImage) this.topImage.destroy(true);
        if (this.midImage) this.midImage.destroy(true);
        if (this.botImage) this.botImage.destroy(true);
        if (this.mText) this.mText.destroy(true);
        this.mWidth = 0;
        this.mHeight = 0;
        this.removeAllListeners();
        this.removeAll();
        super.destroy(true);
    }

    protected preLoad() {
        this.scene.load.atlas(this.resStr, this.resUrl, this.resJson);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
        this.scene.load.start();
    }

    protected init() {
        this.topImage = this.scene.make.image(undefined, false);
        this.topImage.setOrigin(0, 0);
        this.topImage.setTexture(this.resStr, ToolTip.TOP);

        this.midImage = this.scene.make.image(undefined, false);
        this.midImage.setOrigin(0, 0);
        this.midImage.setTexture(this.resStr, ToolTip.MID);

        this.botImage = this.scene.make.image(undefined, false);
        this.botImage.setOrigin(0, 0);
        this.botImage.setTexture(this.resStr, ToolTip.BOT);

        this.mText = this.scene.make.text(undefined, false);
        this.mText.setFontFamily("YaHei");
        this.mText.setFontStyle("bold");
        this.mText.setFontSize(14);
        this.mText.style.align = "center";
        this.mText.lineSpacing = 15;

        this.mWidth = this.topImage.width;
        this.mBaseMidHeight = this.midImage.height;
        this.mText.style.fixedWidth = this.mWidth - 20;
        this.mText.style.setWordWrapWidth(this.mWidth - 20, true);
        // this.mText.style.setMaxLines(10);
        this.add(this.topImage);
        this.add(this.midImage);
        this.add(this.botImage);
        this.add(this.mText);

    }

    protected refreshTip() {
        this.midImage.scaleY = (this.mText.height + 20) / this.mBaseMidHeight;
        this.mHeight = this.topImage.height + this.midImage.height * this.midImage.scaleY + this.botImage.height;
        this.topImage.y = -this.topImage.height >> 1;
        this.midImage.y = this.topImage.y + this.topImage.height;
        this.botImage.y = this.midImage.y + this.midImage.height * this.midImage.scaleY;
        this.mText.x = this.mWidth - this.mText.style.fixedWidth >> 1;
        this.mText.y = this.mHeight - this.mText.height - 10 >> 1;
        this.setSize(this.mWidth, this.mHeight);
    }

    private onLoadComplete() {
        this.init();
    }

}
