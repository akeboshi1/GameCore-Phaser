import { ButtonEventDispatcher } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { i18n, UIHelper } from "utils";

export class BackTextButton extends ButtonEventDispatcher {
    private titleTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.init();
    }
    public setText(text: string) {
        this.titleTex.text = text;
    }
    public setTextStyle(style: any) {
        this.titleTex.setStyle(style);
    }
    public setFontStyle(style: string = "bold") {
        this.titleTex.setFontStyle(style);
    }
    protected init() {
        const width = 100 * this.dpr;
        const height = 40 * this.dpr;
        this.setSize(width, height);
        this.enable = true;
        const closeimg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "back_arrow" });
        closeimg.x = -this.width * 0.5 + closeimg.width * 0.5 + 10 * this.dpr;
        const titleTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr, 20) }).setOrigin(0, 0.5);
        titleTex.setFontStyle("bold");
        titleTex.x = closeimg.x + closeimg.width * 0.5 + 10 * this.dpr;
        this.titleTex = titleTex;
        this.add([closeimg, titleTex]);
    }
}
