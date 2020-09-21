import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { Handler } from "../../Handler/Handler";
import { i18n } from "../../i18n";
import { NineSlicePatch, Button, ClickEvent } from "apowophaserui";
export class PicBusinessContentPanel extends Phaser.GameObjects.Container {
    private bg: NineSlicePatch;
    private topbg: Phaser.GameObjects.Image;
    private titleText: Phaser.GameObjects.Text;
    private titlebg: Phaser.GameObjects.Image;
    private closeBtn: Button;
    private dpr: number;
    private key: string;
    private key2: string;
    private closeHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, key: string, key2: string) {
        super(scene, x, y);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.create();
    }

    create() {
        const width = this.width;
        const height = this.height;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasKey.common2Key, "bg",{
            left: 70 * this.dpr,
            top: 30 * this.dpr,
            right: 30 * this.dpr,
            bottom: 70 * this.dpr
        });
        this.add(this.bg);
        const posY = -height * 0.5;
        this.topbg = this.scene.make.image({ key: this.key, frame: "eaves" });
        this.topbg.y = posY - 2 * this.dpr;
        this.add(this.topbg);
        this.titlebg = this.scene.make.image({ key: this.key, frame: "title" });
        this.titlebg.y = posY - 25 * this.dpr;
        this.add(this.titlebg);
        const mfont = `bold ${15 * this.dpr}px ${Font.BOLD_FONT}`;
        this.titleText = this.scene.make.text({ x: 0, y: this.titlebg.y - 5 * this.dpr, text: i18n.t("business_street.commercial_street"), style: { font: mfont, bold: true, color: "#FFD248" } }).setOrigin(0.5, 0);
        this.titleText.setStroke("#553100", 2 * this.dpr);
        this.titleText.setShadow(2, 2, "#553100", 4 * this.dpr, true, true);
        this.add(this.titleText);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
        this.closeBtn.setPosition(this.width * 0.5 - 6 * this.dpr, posY + this.dpr * 5);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.add(this.closeBtn);
        this.setContentSize(width, height);
    }

    public setContentSize(width: number, height: number) {
        this.setSize(width, height);
        this.bg.resize(width, height);
        const posY = -height * 0.5;
        this.topbg.y = posY - 2 * this.dpr;
        this.titlebg.y = posY - 25 * this.dpr;
        this.titleText.y = this.titlebg.y - 5 * this.dpr;
        this.closeBtn.setPosition(this.width * 0.5 - 6 * this.dpr, posY + this.dpr * 5);

    }

    public setTitleText(text: string) {
        this.titleText.text = text;
    }

    public setCloseHandler(handler: Handler) {
        this.closeHandler = handler;
    }

    private onCloseHandler() {
        if (this.closeHandler) this.closeHandler.run();
    }
}
