import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url, Border, BlueButton } from "../../utils/resUtil";
import { Size } from "../../utils/size";
import { NinePatch } from "../components/nine.patch";
import { op_client } from "pixelpai_proto";
import { BBCodeText } from "apowophaserui";
export class MessageBoxView extends BasePanel {
    private mTxt: BBCodeText;
    private mButtons: NinePatchButton[];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width >> 1;
            this.y = size.height >> 1;
        } else {
            this.x = size.width >> 1;
            this.y = size.height >> 1;
        }
    }

    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        super.show(param);
        if (!this.mInitialized) {
            return;
        }
        this.mButtons = [];
        if (param[0] && param[0].text && param[0].text[0]) {
            this.mTxt.setText(param[0].text[0].text);
        }
        const buttons = param[0].button;
        // buttons.push({text:"测试",});
        if (buttons) {
            const btnWid: number = 46;
            const btnHei: number = 24;
            const w = (this.mWidth) / buttons.length;
            const btnSp = this.mScene.make.container(undefined, false);
            btnSp.y = this.mHeight - btnHei - 100;
            for (let i = 0; i < buttons.length; i++) {
                const txt: string = buttons[i] ? buttons[i].text : "";
                const btn = new NinePatchButton(this.mScene, 0, 0, btnWid, btnHei, "button_blue", "button_blue", buttons[i].text, BlueButton.getConfig(), buttons[i]);
                btn.x = i * w + btnWid / 2;
                this.mButtons.push(btn);
                btnSp.add(btn);
            }
            btnSp.setSize((buttons.length - 1) * w + btnWid, btnHei);
            btnSp.x = this.width - btnSp.width >> 1;
            this.add(btnSp);
        }
        this.resize();
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

        const border = new NinePatch(this.scene, 0, 0, this.mWidth, this.mHeight, Border.getName(), null, Border.getConfig());
        border.x = 0;
        border.y = 0;
        this.add(border);

        this.mTxt = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "16px",
            wrap: {
                mode: "char",
                width: border.width
            },
            halign: "center"
        });
        this.mTxt.x = -this.mWidth / 2 + 10;
        this.mTxt.y = -this.mHeight / 2 + 10;
        this.add(this.mTxt);
        super.init();
    }
}
