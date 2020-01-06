import { Panel } from "../components/panel";
import { Background, Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { NinePatch } from "../components/nine.patch";
import { Logger } from "../../utils/log";
import { DebugLoggerMediator } from "./debug.logger.mediator";
import { IconBtn } from "../baseView/mobile/icon.btn";

export class DebugLogger extends Panel {
    private mBgWidth: number;
    private mBgHeight: number;
    private mTimeTF: Phaser.GameObjects.Text;
    private mDescTF: Phaser.GameObjects.Text;
    private mBackground: NinePatch;
    private mDescTxt: string;
    private mDelay: number = 0;
    private mClsBtn: IconBtn;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    public show(param?: any) {
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShowing = true;
        this.resize();
    }
    public resize(wid?: number, hei?: number) {
        const size: Size = this.mWorld.getSize();
        this.showDescTxT();
        if (this.mWorld.game.device.os.desktop) {
            this.x = ((this.width >> 1) + 60) * this.mWorld.uiScale;
            this.y = (this.height >> 1) * this.mWorld.uiScale;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            } else {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            }
        }
        this.mBgWidth = 400;
        this.mBgHeight = size.height >> 1;
        this.setSize(this.mBgWidth, this.mBgHeight);
    }
    public update(param: any) {
        const now: number = this.mWorld.roomManager.currentRoom.now();
        if (this.mDelay - now < 3000) {
            this.showDescTxT();
            this.mTimeTF.setText("FPS:" + param);
            this.mDescTF.setText(this.mDescTxt);
            this.mDelay = now;
        }
    }
    public destroy() {
        if (this.mBackground) {
            this.mBackground.destroy();
        }
        if (this.mDescTF) {
            this.mDescTF.destroy();
        }
        this.mDescTxt = "";
        this.mBackground = null;
        this.mDescTF = null;
        this.mBgWidth = 0;
        this.mBgHeight = 0;
        this.mDelay = 0;
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.scene.load.image("logger", Background.getPNG());
        this.mScene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        super.preload();
    }

    protected init() {
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        const size: Size = this.mWorld.getSize();
        this.mBgWidth = 400;
        this.mBgHeight = size.height >> 1;
        this.mBackground = new NinePatch(this.mScene, 0, 0,
            this.mBgWidth,
            this.mBgHeight,
            "logger",
            null,
            Background.getConfig()
        );
        this.add(this.mBackground);
        this.mTimeTF = this.mScene.make.text({
            style: {
                x: 0,
                y: 0,
                fontFamily: "YaHei",
                fontSize: 20,
                origin: { x: 0, y: 0 },
                wordWrap: { width: size.width - 10, height: 20, useAdvancedWrap: true }
            }
        }, false);
        this.mDescTF = this.mScene.make.text({
            style: {
                x: 0,
                y: 0,
                fontFamily: "YaHei",
                fontSize: 20,
                origin: { x: 0, y: 0 },
                wordWrap: { width: size.width - 10, height: size.height - 30, useAdvancedWrap: true }
            }
        }, false);
        this.mTimeTF.x = -this.mBgWidth / 2 + 5;
        this.mDescTF.x = -this.mBgWidth / 2 + 5;
        this.mTimeTF.y = -this.mBgHeight / 2 + 5;
        this.mDescTF.y = -this.mBgHeight / 2 + 23;
        this.add(this.mTimeTF);
        this.add(this.mDescTF);
        this.setSize(this.mBgWidth, this.mBgHeight);
        if (!this.mWorld.game.device.os.desktop) {
            this.mClsBtn = new IconBtn(this.mScene, this.mWorld, "clsBtn", ["btn_normal", "btn_over", "btn_click"], "", 1);
            this.mClsBtn.x = this.width / 2 - 35;
            this.mClsBtn.y = -this.height / 2;
            this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
            this.mClsBtn.on("pointerup", this.closeHandler, this);
            this.add(this.mClsBtn);
        }
        super.init();
    }

    protected tweenComplete(show) {
        super.tweenComplete(show);
        if (show) (this.mWorld.uiManager.getMediator(DebugLoggerMediator.NAME) as DebugLoggerMediator).resize();
    }

    private showDescTxT() {
        const orientation: string = this.mWorld.getSize().width > this.mWorld.getSize().height ? "LANDSCAPE" : "PORTRAIT";
        let renderType: string = "WEBGL";
        if (this.mWorld.game.config.renderType === Phaser.CANVAS) {
            renderType = "CANVAS";
        } else if (this.mWorld.game.config.renderType === Phaser.HEADLESS) {
            renderType = "HEADLESS";
        }
        this.mDescTxt = "rendertype:" + renderType + "\n" + " width: " + this.mWorld.getSize().width + "\n" + "height: " + this.mWorld.getSize().height + "\n" + "orientation: " + orientation + "\n" + "devicePixelRatio: " + window.devicePixelRatio;
        this.showErrTxt();
    }

    private closeHandler() {
        const med: DebugLoggerMediator = this.mWorld.uiManager.getMediator(DebugLoggerMediator.NAME) as DebugLoggerMediator;
        med.hide();
    }

    private showErrTxt() {
        const errList: string[] = Logger.getInstance().getErrorList();
        if (!errList) {
            return;
        }
        let errStr: string = "";
        errList.forEach((str) => {
            errStr += "\n" + str;
        });
        this.mDescTxt += errStr;
    }
}
