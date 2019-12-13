import { Panel } from "../../components/panel";
import { WorldService } from "../../../game/world.service";
import { IconBtn } from "./icon.btn";
import { Url } from "../../../utils/resUtil";
import { IconSelectBtn } from "./icon.select.btn";

export class LeftBtnGroup extends Panel {
    private mExpandBtn: IconSelectBtn;
    private mCollapse: boolean = false;
    private mResKey: string;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    public show(param?: any) {
        this.scaleX = this.scaleY = this.mWorld.uiScale;
        super.show(param);
    }

    public resize() {
        this.x = this.width + 5 * this.mWorld.uiScale;
        this.y = this.height / 2 + 10 * this.mWorld.uiScale;
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public destroy() {
        if (this.mExpandBtn) {
            this.mExpandBtn.destroy();
        }
        this.mResKey = "";
        this.mExpandBtn = null;
        this.mCollapse = false;
        super.destroy();
    }

    public tweenView(show: boolean) {
        const baseX = this.width + 5 * this.mWorld.uiScale;
        const toX: number = show === true ? baseX : baseX - 50;
        const toAlpha: number = show === true ? 1 : 0;
        this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props: {
                x: { value: toX },
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
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        let hei: number = 0;
        // const btnResList: string[] = this.mCollapse === false ? ["btnGroup_expand.png", "btnGroup_expand.png", "btnGroup_collapse.png", "btnGroup_collapse.png"] : ["btnGroup_collapse.png", "btnGroup_collapse.png", "btnGroup_expand.png", "btnGroup_expand.png"];
        this.mExpandBtn = new IconSelectBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_expand.png", "btnGroup_collapse.png"], 1);
        this.add(this.mExpandBtn);
        this.mExpandBtn.setClick(() => {
            if (!this.mCollapse) {
                this.mWorld.startFullscreen();
            } else {
                this.mWorld.stopFullscreen();
            }
            this.mExpandBtn.setBgRes(Number(!this.mCollapse));
            this.mCollapse = !this.mCollapse;
        });
        hei += this.mExpandBtn.height / 2 + 20;
        this.setSize(this.mExpandBtn.width, hei);
        this.resize();
        super.init();
    }

}
