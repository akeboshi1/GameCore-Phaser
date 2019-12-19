import { Panel } from "../../components/panel";
import { WorldService } from "../../../game/world.service";
import { Size } from "../../../utils/size";
import { Url } from "../../../utils/resUtil";
import { IconBtn } from "./icon.btn";

export class TopBtnGroup extends Panel {
    // private mWid: number = 0;
    private mBtnPad: number = 10;
    private mBtnX: number = 0;
    private mBtnList: IconBtn[];
    private mResKey: string;
    private mTurnBtn: IconBtn;
    private mReturnBtn: IconBtn;
    // 排行榜按钮
    private mRankBtn: IconBtn;
    private mExpandBoo: boolean = false;
    private mAddBtnDataList: any[];
    private mRemoveBtnDataList: any[];
    private mOrientation: number = Phaser.Scale.Orientation.LANDSCAPE;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public show(param?: any) {
        this.scaleX = this.scaleY = this.mWorld.uiScale;
        super.show(param);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width - 50 * this.mWorld.uiScale;
        this.y = this.height / 2 + 10 * this.mWorld.uiScale;
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public destroy() {
        this.mBtnX = 0;
        if (this.mTurnBtn) {
            this.mTurnBtn.destroy();
        }

        if (this.mReturnBtn) {
            this.mReturnBtn.destroy();
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
        if (!this.mScene) return;
        const baseY: number = this.height / 2 + 10 * this.mWorld.uiScale;
        const toY: number = show === true ? baseY : baseY - 50;
        const toAlpha: number = show === true ? 1 : 0;
        this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Cubic.Out",
            props: {
                y: { value: toY },
                alpha: { value: toAlpha },
            },
        });
    }

    public addBtn(data: any) {
        if (!this.mAddBtnDataList) this.mAddBtnDataList = [];
        if (!this.mInitialized) {
            this.mAddBtnDataList.push(data);
            return;
        }
        const btn: IconBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, data.bgTextureList, data.iconTexture, 1);
        if (data.medKey) btn.setMedName(data.medKey);
        btn.setClick(() => {
            const medName: string = btn.getMedName();
            if (!medName) return;
            const med = this.mWorld.uiManager.getMediator(medName);
            if (med) {
                // 该判断条件用于某些常驻界面ui在移动端需要手动打开，客户端将此逻辑修改为通过后端发送的showui数据将入口按钮变成是否常驻
                // 好处在于移动端客户端界面让玩家自行选择是否打开，减少ui布局混乱的情况
                const param = med.getParam();
                med.show(param);
            } else {
                // todo 该判断条件用于热发布活动，后端需要在pi中加一条活动按钮数据，不包含med具体代码，只有name，btnres等数据即可，等需要打开界面时在请求具体数据
                // 客户端只需要发送medname给后端，后端发送showui给客户端，好处在于每次打开都是请求后端打开界面，活动数据是实时的
            }
        });
        this.mBtnList.push(btn);
        this.btnRefreshPos();
    }

    public removeBtn(data: any) {
        if (this.mRemoveBtnDataList) this.mRemoveBtnDataList = [];
        if (!this.mInitialized) {
            this.mRemoveBtnDataList.push(data);
            return;
        }
        for (let i: number = 0, len = this.mBtnList.length; i < len; i++) {
            let btn: IconBtn = this.mBtnList[i];
            if (!btn) continue;
            const medName: string = btn.getMedName();
            if (medName && medName === data.medKey) {
                btn.destroy();
                btn = null;
                this.mBtnList.splice(i, 1);
                break;
            }
        }
        this.btnRefreshPos();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResKey = "baseView";
        this.mScene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        let hei: number = 0;
        let wid: number = 0;
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.mBtnList = [];
        this.mBtnX = 0;
        this.mTurnBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"], "btnGroup_top_expand.png", 1);
        this.mTurnBtn.x = this.mBtnX;
        this.mTurnBtn.setPos(this.mBtnX, 0);
        wid += this.mTurnBtn.width + this.mBtnPad;
        this.add(this.mTurnBtn);
        this.mBtnX += -this.mTurnBtn.width - this.mBtnPad;
        hei += this.mTurnBtn.height / 2 + 20;
        this.mReturnBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_white_normal.png", "btnGroup_white_light.png", "btnGroup_white_select.png"], "btnGroup_top_expand.png", 1);
        this.mReturnBtn.x = this.mBtnX;
        this.mReturnBtn.setPos(this.mBtnX, 0);
        this.mBtnList.push(this.mReturnBtn);
        wid += this.mReturnBtn.width + this.mBtnPad;
        this.add(this.mReturnBtn);
        this.mBtnX += -this.mReturnBtn.width - this.mBtnPad;
        this.setSize(wid, hei);
        this.mTurnBtn.setClick(() => {
            this.turnHandler();
        });
        this.mReturnBtn.setClick(() => {
            this.mWorld.closeGame();
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
            if (this.mRemoveBtnDataList) {
                this.mRemoveBtnDataList.forEach((btnData) => {
                    this.removeBtn(btnData);
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
            this.mScene.tweens.add({
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
