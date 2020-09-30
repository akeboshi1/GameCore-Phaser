import { BasePanel } from "../../Components/BasePanel";
import { IconBtn, IBtnData } from "../Icon.btn";
import { DebugLoggerMediator } from "../../DebugLogger/DebugLoggerMediator";
import { UIMediatorType } from "../../Ui.mediatorType";
import { WorldService } from "../../../world.service";
import { Url } from "../../../../utils/resUtil";
import { Size } from "../../../../utils/size";

export class TopBtnGroup extends BasePanel {
    // private mWid: number = 0;
    private mBtnPad: number = 10;
    private mBtnX: number = 0;
    private mBtnList: IconBtn[];
    private mResKey: string;
    private mTurnBtn: IconBtn;
    private mReturnBtn: IconBtn;
    private mDebugBtn: IconBtn;
    // 排行榜按钮
    private mRankBtn: IconBtn;
    private mExpandBoo: boolean = false;
    private mAddBtnDataList: any[];
    private mRemoveBtnKeyList: any[];
    private mOrientation: number = Phaser.Scale.Orientation.LANDSCAPE;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.disInteractive();
    }

    public show(param?: any) {
        this.scale = this.mWorld.uiScale;
        super.show(param);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width - 50 * this.mWorld.uiScale;
        this.y = this.height / 2 + 10 * this.mWorld.uiScale;
        this.scale = this.mWorld.uiScale;
    }

    public destroy() {
        this.mBtnX = 0;
        if (this.mTurnBtn) {
            this.mTurnBtn.destroy();
        }

        if (this.mReturnBtn) {
            this.mReturnBtn.destroy();
        }

        if (this.mDebugBtn) {
            this.mDebugBtn.destroy();
        }

        if (this.mBtnList) {
            this.mBtnList.forEach((btn) => {
                if (btn) {
                    btn.destroy();
                    btn = null;
                }
            });
        }
        this.mResKey = "";
        this.mBtnList = null;
        this.mTurnBtn = null;
        this.mReturnBtn = null;
        super.destroy();
    }

    public tweenView(show: boolean) {
        if (!this.scene) return;
        const baseY: number = this.height / 2 + 10 * this.mWorld.uiScale;
        const toY: number = show === true ? baseY : baseY - 50;
        const toAlpha: number = show === true ? 1 : 0;
        this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Cubic.Out",
            props: {
                y: { value: toY },
                alpha: { value: toAlpha },
            },
        });
    }

    public addBtn(data: IBtnData) {
        if (!this.mAddBtnDataList) this.mAddBtnDataList = [];
        if (!this.mInitialized) {
            this.mAddBtnDataList.push(data);
            return;
        }
        const btn: IconBtn = new IconBtn(this.scene, this.mWorld, data);
        this.mBtnList.push(btn);
        this.btnRefreshPos();
    }

    public removeBtn(key: string) {
        if (this.mRemoveBtnKeyList) this.mRemoveBtnKeyList = [];
        if (!this.mInitialized) {
            this.mRemoveBtnKeyList.push(key);
            return;
        }
        for (let i: number = 0, len = this.mBtnList.length; i < len; i++) {
            let btn: IconBtn = this.mBtnList[i];
            if (!btn) continue;
            const btnKey: string = btn.getKey();
            if (btnKey && btnKey === key) {
                btn.destroy();
                btn = null;
                this.mBtnList.splice(i, 1);
                break;
            }
        }
        this.btnRefreshPos();
    }

    protected preload() {
        if (!this.scene) {
            return;
        }
        this.mResKey = "baseView";
        this.scene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        let hei: number = 0;
        let wid: number = 0;
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.mBtnList = [];
        this.mBtnX = 0;
        this.mTurnBtn = new IconBtn(this.scene, this.mWorld, {
            key: UIMediatorType.Turn_Btn_Top, bgResKey: this.mResKey, bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
            iconResKey: this.mResKey, iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
        this.mTurnBtn.x = this.mBtnX;
        this.mTurnBtn.setPos(this.mBtnX, 0);
        wid += this.mTurnBtn.width + this.mBtnPad;
        this.add(this.mTurnBtn);
        this.mBtnX += -this.mTurnBtn.width - this.mBtnPad;
        hei += this.mTurnBtn.height / 2 + 20;
        if (!this.mWorld.game.device.os.desktop) {
            this.mReturnBtn = new IconBtn(this.scene, this.mWorld, {
                key: UIMediatorType.App_Back, bgResKey: this.mResKey, bgTextures: ["btnGroup_white_normal.png", "btnGroup_white_light.png", "btnGroup_white_select.png"],
                iconResKey: this.mResKey, iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
            });
            this.mReturnBtn.x = this.mBtnX;
            this.mReturnBtn.setPos(this.mBtnX, 0);
            this.mBtnList.push(this.mReturnBtn);
            wid += this.mReturnBtn.width + this.mBtnPad;
            this.add(this.mReturnBtn);
            this.mBtnX += -this.mReturnBtn.width - this.mBtnPad;
            this.mDebugBtn = new IconBtn(this.scene, this.mWorld, {
                key: DebugLoggerMediator.NAME, bgResKey: this.mResKey, bgTextures: ["btnGroup_blue_normal.png", "btnGroup_blue_light.png", "btnGroup_blue_select.png"],
                iconResKey: this.mResKey, iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
            });
            this.mDebugBtn.x = this.mBtnX;
            this.mDebugBtn.setPos(this.mBtnX, 0);
            this.mBtnList.push(this.mDebugBtn);
            wid += this.mDebugBtn.width + this.mBtnPad;
            this.add(this.mDebugBtn);
            this.mReturnBtn.setClick(() => {
                this.mWorld.closeGame();
            });
            this.mDebugBtn.setClick(() => {
                let debugLogMed: DebugLoggerMediator = this.mWorld.uiManager.getMediator(DebugLoggerMediator.NAME) as DebugLoggerMediator;
                if (!debugLogMed) {
                    this.mWorld.uiManager.setMediator(DebugLoggerMediator.NAME, new DebugLoggerMediator(this.mWorld.uiManager.getUILayerManager(), this.scene, this.mWorld));
                    debugLogMed = this.mWorld.uiManager.getMediator(DebugLoggerMediator.NAME) as DebugLoggerMediator;
                }
                if (debugLogMed.isShow()) {
                    debugLogMed.hide();
                    return;
                }
                debugLogMed.show();
            });
        }
        this.setSize(wid, hei);
        this.mTurnBtn.setClick(() => {
            this.turnHandler();
        });
        this.resize();
        super.init();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) {
            if (this.mAddBtnDataList) {
                this.mAddBtnDataList.forEach((btnData) => {
                    this.addBtn(btnData);
                });
            }
            if (this.mRemoveBtnKeyList) {
                this.mRemoveBtnKeyList.forEach((key) => {
                    this.removeBtn(key);
                });
            }
        }
    }

    private turnHandler() {
        if (!this.mBtnList && this.mBtnList.length < 1) {
            return;
        }
        const len: number = this.mBtnList.length;
        for (let i: number = 0; i < len; i++) {
            const btn: IconBtn = this.mBtnList[i];
            const toX: number = this.mExpandBoo ? btn.getPos().x : this.mTurnBtn.width >> 1;
            const toAlpha: number = this.mExpandBoo ? 1 : 0;
            const easeType: string = this.mExpandBoo ? "Sine.easeIn" : "Sine.easeOut";
            this.scene.tweens.add({
                targets: btn,
                duration: 300,
                ease: easeType,
                props: {
                    x: { value: toX },
                    alpha: { value: toAlpha }
                },
                onComplete: (tween, targets, ship) => {
                    if (i === len - 1) {
                        this.mExpandBoo = !this.mExpandBoo;
                    }
                },
                onCompleteParams: [this]
            });
        }
    }

    private btnRefreshPos() {
        if (this.mBtnList && this.mBtnList.length > 1) {
            this.mBtnX = -this.mTurnBtn.width - this.mBtnPad;
            const hei: number = this.mTurnBtn.height / 2 + 20;
            let wid: number = 0;
            this.mBtnList.forEach((btn) => {
                if (!btn) return;
                btn.x = this.mBtnX;
                // btn.setBtnData({});
                btn.setPos(this.mBtnX, 0);
                this.mBtnX += -btn.width - this.mBtnPad;
                wid += btn.width + this.mBtnPad;
                // btn.setClick(() => {
                //     // todo connect
                // });
                this.add(btn);
            });
            this.setSize(wid, hei);
        }
        this.resize();
    }

}
