import { BasePanel } from "./base.panel";
import { Button, BBCodeText, ClickEvent } from "apowophaserui";
import { Render } from "../../render";
import { Font, i18n } from "../../../utils";

export class AlertView extends BasePanel {
    private key: string = "pica_alert";
    private mOkBtn: Button;
    private mCancelBtn: Button;
    private mContent: BBCodeText;
    private mTitleLabel: Phaser.GameObjects.Text;
    private mOkText: string;
    constructor(scene: Phaser.Scene, render: Render) {
        super(scene, render);
        this.disInteractive();
    }

    show(config: IAlertConfig) {
        this.mShowData = config;
        super.show(config);
        if (this.mInitialized) {
            this.mWorld.uiManager.getUILayerManager().addToDialogLayer(this);
            const { ox, oy } = config;
            this.x = (ox || this.scene.cameras.main.width / 2);
            this.y = (oy || this.scene.cameras.main.height / 2);

            this.mContent.setText(config.text);
            if (config.title) {
                this.mTitleLabel.setText(config.title);
            }
            // if (config.btns === Buttons.Ok) {

            // }
            const btns = config.btns;
            if (btns === Buttons.Cancel) {
                this.remove(this.mOkBtn);
                this.mCancelBtn.x = 0;
            } else if (btns === Buttons.Ok) {
                this.remove(this.mCancelBtn);
                this.mOkBtn.x = 0;
            }

        }
    }

    preload() {
        this.addAtlas(this.key, "pica_alert/pica_alert.png", "pica_alert/pica_alert.json");
        super.preload();
    }

    setOKText(val: string) {
        this.mOkText = val;
        if (this.mOkBtn) {
            this.mOkBtn.setText(val);
        }
        return this;
    }

    protected init() {
        const zoom = this.mWorld.uiScale || 1;
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
            text: i18n.t("common.tips"),
            style: {
                fontFamily: Font.DEFULT_FONT,
                fontSize: 12 * this.dpr * zoom,
                color: "#905B06"
            }
        }, false).setOrigin(0.5);
        this.mTitleLabel.y = title.y;

        this.mContent = new BBCodeText(this.scene, 0, -11 * this.dpr, "", {
            fontSize: 12 * this.dpr * zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            color: "#0",
            wrap: {
                mode: "char",
                width: 218 * this.dpr
            }
        });
        this.mContent.setOrigin(0.5, 0.5);

        this.mOkBtn = new Button(this.scene, this.key, "yellow_btn.png", undefined, this.mOkText || i18n.t("common.confirm"));
        this.mOkBtn.setTextStyle({
            color: "#905B06",
            fontFamily: Font.DEFULT_FONT,
            fontSize: 13 * this.dpr * zoom
        });
        this.mOkBtn.x = (bg.width - this.mOkBtn.displayWidth) / 2 - 38 * this.dpr;
        this.mOkBtn.y = (bg.height - this.mOkBtn.displayHeight) / 2 - 16 * this.dpr;
        this.mOkBtn.on(ClickEvent.Tap, this.onOkHandler, this);

        this.mCancelBtn = new Button(this.scene, this.key, "red_btn.png", undefined, i18n.t("common.cancel"));
        this.mCancelBtn.setTextStyle({
            fontFamily: Font.DEFULT_FONT,
            fontSize: 13 * this.dpr * zoom
        });
        this.mCancelBtn.x = -(bg.width - this.mCancelBtn.displayWidth) / 2 + 38 * this.dpr;
        this.mCancelBtn.y = this.mOkBtn.y;
        this.mCancelBtn.on(ClickEvent.Tap, this.onCancelHandler, this);
        this.add([bg, title, this.mTitleLabel, this.mTitleLabel, this.mContent, this.mOkBtn, this.mCancelBtn]);
        super.init();
    }

    private onOkHandler() {
        if (!this.mShowData) {
            return;
        }
        const callback = this.mShowData.callback;
        if (callback) {
            callback.call(this.mShowData.content);
        }
        this.onCancelHandler();
    }

    private onCancelHandler() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }
}

export interface IAlertConfig {
    text: string;
    title?: string;
    callback: Function;
    content?: any;
    ox?: number;
    oy?: number;
    btns?: Buttons;
}

export enum Buttons {
    Ok,
    Cancel,
    OKAndCancel,
}
