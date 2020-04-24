import { BasePanel } from "./BasePanel";
import { WorldService } from "../../game/world.service";
import { Button } from "./button";
import { Font } from "../../utils/font";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbocdetext/BBCodeText.js";

export class AlertView extends BasePanel {
    private key: string = "pica_alert";
    private mOkBtn: Button;
    private mCancelBtn: Button;
    private mContent: BBCodeText;
    private mTitleLabel: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.disInteractive();
    }

    show(config: IAlertConfig) {
        this.data = config;
        super.show(config);
        if (this.mInitialized) {
            this.mWorld.uiManager.getUILayerManager().addToDialogLayer(this.container);
            this.x = this.scene.cameras.main.width / 2;
            this.y = this.scene.cameras.main.height / 2;

            this.mContent.setText(config.text);
            if (config.title) {
                this.mTitleLabel.setText(config.title);
            }
        }
    }

    preload() {
        this.addAtlas(this.key, "pica_alert/pica_alert.png", "pica_alert/pica_alert.json");
        super.preload();
    }

    protected init() {
        const zoom = this.mWorld.uiScaleNew || 1;
        const bg = this.scene.make.image({
            key: this.key,
            frame: "bg.png"
        }, false);

        const title = this.scene.make.image({
            key: this.key,
            frame: "title.png"
        }, false);
        title.y = -bg.height / 2;

        this.mTitleLabel = this.scene.make.text({
            text: "丢弃",
            style: {
                fontFamily: Font.DEFULT_FONT,
                fontSize: 8 * this.dpr * zoom,
                color: "#905B06"
            }
        }, false).setOrigin(0.5);
        this.mTitleLabel.y = title.y;

        this.mContent = new BBCodeText(this.scene, 0, -11 * this.dpr, "", {
            fontSize: 9 * this.dpr * zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            color: "#0",
            wrap: {
                mode: "char",
                width: 145 * this.dpr
            }
        });
        this.mContent.setOrigin(0.5, 0.5);
        this.mContent.setText("[color=#FF0000]里卡多flashed分肤是的肌肤是路径[/color]");

        this.mOkBtn = new Button(this.scene, this.key, "yellow_btn.png", undefined, "确定");
        this.mOkBtn.setTextStyle({
            color: "#905B06",
            fontFamily: Font.DEFULT_FONT,
            fontSize: 8 * this.dpr * zoom
        });
        this.mOkBtn.x = (bg.width - this.mOkBtn.width) / 2 - 20 * this.dpr;
        this.mOkBtn.y = (bg.height - this.mOkBtn.height) / 2 - 11 * this.dpr;
        this.mOkBtn.on("click", this.onOkHandler, this);

        this.mCancelBtn = new Button(this.scene, this.key, "red_btn.png", undefined, "取消");
        this.mCancelBtn.setTextStyle({
            fontFamily: Font.DEFULT_FONT,
            fontSize: 8 * this.dpr * zoom
        });
        this.mCancelBtn.x = -(bg.width - this.mCancelBtn.width) / 2 + 20 * this.dpr;
        this.mCancelBtn.y = this.mOkBtn.y;
        this.mCancelBtn.on("click", this.onCancelHandler, this);
        this.add([bg, title, this.mTitleLabel, this.mTitleLabel, this.mContent, this.mOkBtn, this.mCancelBtn]);
        super.init();
    }

    private onOkHandler() {
        if (!this.data) {
            return;
        }
        const callback = this.data.callback;
        if (callback) {
            callback.call(this.data.content);
        }
        this.onCancelHandler();
    }

    private onCancelHandler() {
        if (!this.container) {
            return;
        }
        if (this.container.parentContainer) {
            this.container.parentContainer.remove(this.container);
        }
    }
}

export interface IAlertConfig {
    text: string;
    title?: string;
    callback: Function;
    content?: any;
}
