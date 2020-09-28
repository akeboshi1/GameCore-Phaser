import { BasePanel } from "../Components/BasePanel";
import { DebugLoggerMediator } from "./DebugLoggerMediator";
import { IconBtn } from "../BaseView/Icon.btn";
import { UIMediatorType } from "../Ui.mediatorType";
import { WorldService } from "../../world.service";
import { Size } from "../../../../utils/size";
import { Url } from "../../../../utils/resUtil";
import { Font } from "../../../../utils/font";
import { Logger } from "../../../../utils/log";

export class DebugLogger extends BasePanel {
    private mBgWidth: number;
    private mBgHeight: number;
    private mTimeTF: Phaser.GameObjects.Text;
    private mDescTF: Phaser.GameObjects.Text;
    private mBackground: Phaser.GameObjects.Graphics;
    private mDescTxt: string;
    private mDelay: number = 0;
    private mClsBtn: IconBtn;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
    }

    public addListen() {
        // if (this.mWorld.game.device.os.desktop) {
            this.mClsBtn.on("pointerup", this.closeHandler, this);
        // }
    }

    public removeListen() {
        if (!this.mWorld.game.device.os.desktop) {
            this.mClsBtn.off("pointerup", this.closeHandler, this);
        }
    }

    public show(param?: any) {
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShow = true;
        this.resize();
    }

    public resize(wid?: number, hei?: number) {
        const size: Size = this.mWorld.getSize();
        this.showDescTxT();
        // if (this.mWorld.game.device.os.desktop) {
        //     this.x = ((this.width >> 1) + 60) * this.mWorld.uiScale;
        //     this.y = (this.height >> 1) * this.mWorld.uiScale;
        // } else {
        //     if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
        //         this.x = size.width >> 1;
        //         this.y = size.height >> 1;
        //     } else {
        //         this.x = size.width >> 1;
        //         this.y = size.height >> 1;
        //     }
        // }
        this.update(0);
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

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        super.preload();
    }

    protected init() {
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        const size: Size = this.mWorld.getSize();
        this.mBgWidth = 400;
        this.mBgHeight = size.height >> 1;
        // this.mBackground = new NinePatch(this.mScene, 0, 0,
        //     this.mBgWidth,
        //     this.mBgHeight,
        //     "logger",
        //     null,
        //     Background.getConfig()
        // );
        const width = this.scene.cameras.main.width / 2;
        const height = this.scene.cameras.main.height;
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, width, height);
        this.setSize(width, height);
        this.add(this.mBackground);
        this.mTimeTF = this.mScene.make.text({
            style: {
                x: 0,
                y: 0,
                fontFamily: Font.DEFULT_FONT,
                fontSize: 14 * this.dpr,
                origin: { x: 0, y: 0 },
                wordWrap: { width: size.width - 10, height: 20, useAdvancedWrap: true }
            }
        }, false);
        this.mDescTF = this.mScene.make.text({
            style: {
                x: 0,
                y: 20 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                fontSize: 14 * this.dpr,
                origin: { x: 0, y: 0 },
                wordWrap: { width: this.width - 10 * this.dpr, height: this.height - 30, useAdvancedWrap: true }
            }
        }, false);
        // this.mTimeTF.x = -this.width / 2 + 5;
        // this.mDescTF.x = -this.width / 2 + 5;
        // this.mTimeTF.y = -this.height / 2 + 5;
        // this.mDescTF.y = -this.height / 2 + 23;
        this.add(this.mTimeTF);
        this.add(this.mDescTF);
        // this.setSize(this.mBgWidth, this.mBgHeight);
        if (!this.mWorld.game.device.os.desktop) {
            this.mClsBtn = new IconBtn(this.mScene, this.mWorld, {
                key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
                iconResKey: "", iconTexture: "", scale: 1, pngUrl: "ui/common/common_clsBtn.png", jsonUrl: "ui/common/common_clsBtn.json"
            });
            this.mClsBtn.x = this.width;
            this.mClsBtn.y = 10 * this.dpr;
            this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
            this.add(this.mClsBtn);
        }
        super.init();

        this.addListen();
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
        // this.mDescTxt = "rendertype:" + renderType + "\n" + " width: " + this.mWorld.getSize().width + "\n" + "height: " + this.mWorld.getSize().height + "\n" + "orientation: " + orientation + "\n" + "devicePixelRatio: " + window.devicePixelRatio;
        const config = this.mWorld.getConfig();
        this.mDescTxt = `
            rendertype: ${renderType}
            size: ${config.width} ${config.height}
            device size: ${this.mWorld.getSize().width.toFixed(2)} ${this.mWorld.getSize().height.toFixed(2)}
            scene scale: ${this.mWorld.scaleRatio}
            devicePixel: ${this.mWorld.uiRatio}
            ui scale: ${this.mWorld.uiScale.toFixed(4)}`;
        // this.showErrTxt();
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
