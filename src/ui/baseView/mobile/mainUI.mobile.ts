import { WorldService } from "../../../game/world.service";
import { Panel } from "../../components/panel";
import { TopBtnGroup } from "./top.btn.group";
import { RightBtnGroup } from "./right.btn.group";
import { BottomBtnGroup } from "./bottom.btn.group";
import { LeftBtnGroup } from "./left.btn.group";

/**
 * 主界面UI mobile版本
 */
export class MainUIMobile extends Panel {
    public static SlotMaxCount: number = 4;
    private mWorld: WorldService;
    private mTopBtnGroup: TopBtnGroup;
    private mRightBtnGroup: RightBtnGroup;
    private mBottomBtnGroup: BottomBtnGroup;
    private mLeftBtnGroup: LeftBtnGroup;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.mTopBtnGroup = new TopBtnGroup(scene, world);
        this.mRightBtnGroup = new RightBtnGroup(scene, world);
        this.mBottomBtnGroup = new BottomBtnGroup(scene, world);
        this.mLeftBtnGroup = new LeftBtnGroup(scene, world);
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public show(param?: any) {
        if (this.mShowing) {
            return;
        }
        this.mTopBtnGroup.show(param);
        this.mRightBtnGroup.show(param);
        this.mBottomBtnGroup.show(param);
        this.mLeftBtnGroup.show(param);
        super.show(param);
    }

    public hide() {
        if (this.mTopBtnGroup) this.mTopBtnGroup.hide();
        if (this.mRightBtnGroup) this.mRightBtnGroup.hide();
        if (this.mBottomBtnGroup) this.mBottomBtnGroup.hide();
        if (this.mLeftBtnGroup) this.mLeftBtnGroup.hide();
        super.hide();
    }
    public resize() {
        if (this.mTopBtnGroup) this.mTopBtnGroup.resize();
        if (this.mRightBtnGroup) this.mRightBtnGroup.resize();
        if (this.mBottomBtnGroup) this.mBottomBtnGroup.resize();
        if (this.mLeftBtnGroup) this.mLeftBtnGroup.resize();
        super.resize();
    }
    public destroy() {
        if (this.mTopBtnGroup) this.mTopBtnGroup.destroy();
        if (this.mRightBtnGroup) this.mRightBtnGroup.destroy();
        if (this.mBottomBtnGroup) this.mBottomBtnGroup.destroy();
        if (this.mLeftBtnGroup) this.mLeftBtnGroup.destroy();
        this.mLeftBtnGroup = null;
        this.mTopBtnGroup = null;
        this.mRightBtnGroup = null;
        this.mBottomBtnGroup = null;
        super.destroy();
    }
}
