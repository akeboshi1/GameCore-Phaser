import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url, Border, BlueButton } from "../../utils/resUtil";
import { Size } from "../../utils/size";
import { NinePatch } from "../components/nine.patch";
import BBCodeText from "../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";
import { op_client } from "pixelpai_proto";
export class MessageBoxView extends Panel {
    private mTxt: BBCodeText;
    private mButtons: NinePatchButton[];
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super(scene);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width - this.width >> 1;
        this.y = size.height - this.height >> 1;
    }

    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        this.mButtons = [];
        this.mTxt.setText(param.text[0].text);
        const buttons = param.button;

        const btnWid: number = 46;
        const btnHei: number = 24;
        const w = (this.width) / (buttons.length + 1);
        for (let i = 0; i < buttons.length; i++) {
            const btn = new NinePatchButton(this.mScene, 0, 0, btnWid, btnHei, "button_blue", buttons[i].text, {
                top: 7,
                bottom: 7,
                left: 7,
                right: 7
            }, buttons[i].node);
            btn.x = (i + 1) * w - (btnWid >> 1);
            btn.y = this.height - btnHei - 5;
            this.mButtons.push(btn);
            this.add(btn);
        }
        super.show(param);
    }

    public hide() {
        super.hide();
    }

    public destroy() {
        if (this.mTxt) {
            this.mTxt.destroy(true);
        }
        if (this.mButtons && this.mButtons.length > 0) {
            this.mButtons.forEach((btn) => {
                if (!btn) return;
                btn.destroy(true);
            });
            this.mButtons.length = 0;
            this.mButtons = [];
        }
        this.mTxt = null;
        this.mButtons = null;
        super.destroy();
    }

    public get buttons(): NinePatchButton[] {
        return this.mButtons;
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.atlas(BlueButton.getName(), BlueButton.getPNG(), BlueButton.getJSON());
        this.mScene.load.image(Border.getName(), Border.getPNG());
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.mWidth = 300;
        this.mHeight = 200;
        const border = new NinePatch(this.scene, 0, 0, this.width, this.height, Border.getName(), null, Border.getConfig());
        border.x = 0;
        border.y = 0;
        this.add(border);

        this.mTxt = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "16px",
            wrap: {
                mode: "char",
                width: 300 * this.mWorld.uiScale
            },
            halign: "left"
        });
        this.add(this.mTxt);
        super.init();
    }
}
