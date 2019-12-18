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
    private mExpandBoo: boolean = false;
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

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResKey = "baseView";
        this.mScene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        let hei: number = 0;
        let wid: number = 0;
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.mBtnList = [];
        this.mBtnX = 0;
        const bgResKey: string = "btnGroup_bg.png";
        this.mTurnBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"], "btnGroup_top_expand.png", 1);
        this.mTurnBtn.x = this.mBtnX;
        this.mTurnBtn.setPos(this.mBtnX, 0);
        wid += this.mTurnBtn.width;
        this.add(this.mTurnBtn);
        this.mBtnX += -this.mTurnBtn.width - this.mBtnPad;
        hei += this.mTurnBtn.height / 2 + 20;
        this.mReturnBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_white_normal.png", "btnGroup_white_light.png", "btnGroup_white_select.png"], "btnGroup_top_expand.png", 1);
        this.mReturnBtn.x = this.mBtnX;
        this.mReturnBtn.setPos(this.mBtnX, 0);
        this.mBtnList.push(this.mReturnBtn);
        wid += this.mReturnBtn.width;
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
                duration: 500,
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

    private btnDataRefresh() {
        if (this.mBtnList) {
            this.mBtnList.forEach((btn) => {
                if (!btn) return;
                this.mBtnX += -btn.width - 8;
                btn.setPos(this.mBtnX, 0);
                // this.mWid += btn.width + 8;
                btn.x = this.mBtnX;
                btn.setBtnData({});
                btn.setClick(() => {
                    // todo connect
                });
                this.add(btn);
            });
        }
        this.resize();
    }

}
