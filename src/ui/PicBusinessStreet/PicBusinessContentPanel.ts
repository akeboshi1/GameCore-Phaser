import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { Handler } from "../../Handler/Handler";
export class PicBusinessContentPanel extends Phaser.GameObjects.Container {
    private bg: NineSlicePatch;
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
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasKey.common2Key, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 40 * this.dpr
        });
        this.add(this.bg);
        const posY = -width * 0.5;
        this.titlebg = this.scene.make.image({ key: this.key, frame: "title" });
        this.titlebg.y = posY;
        this.add(this.titlebg);
        const mfont = `bold ${15 * this.dpr}px ${Font.DEFULT_FONT}`;
        this.titleText = this.scene.make.text({ x: 0, y: posY, text: "", style: { font: mfont, bold: true, color: "#FFD248" } }).setOrigin(0.5, 0);
        this.titleText.setStroke("#ED7814", 4);
        this.add(this.titleText);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setPosition(this.width * 0.5 - this.dpr * 30, posY - this.dpr * 10);
        this.closeBtn.on(CoreUI.MouseEvent.Tap, this.onCloseHandler, this);
        this.add(this.closeBtn);
    }

    public setContentSize(width: number, height: number) {
        this.setSize(width, height);
        this.bg.setSize(width, height);
        const posY = -width * 0.5;
        this.titlebg.y = posY;
        this.closeBtn.setPosition(this.width * 0.5 - this.dpr * 30, posY - this.dpr * 10);
    }

    public setCloseHandler(handler: Handler) {
        this.closeHandler = handler;
    }

    private onCloseHandler() {
        if (this.closeHandler) this.closeHandler.run();
    }
}

