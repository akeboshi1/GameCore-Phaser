import { WorldService } from "../../../game/world.service";
import { Panel } from "../../components/panel";
import { TopBtnGroup } from "./top.btn.group";
import { RightBtnGroup } from "./right.btn.group";
import { BottomBtnGroup } from "./bottom.btn.group";
import { LeftBtnGroup } from "./left.btn.group";
import { op_gameconfig } from "pixelpai_proto";

/**
 * 主界面UI mobile版本
 */
export class MainUIMobile extends Panel {
    public static SlotMaxCount: number = 4;
    private mTopBtnGroup: TopBtnGroup;
    private mRightBtnGroup: RightBtnGroup;
    private mBottomBtnGroup: BottomBtnGroup;
    private mLeftBtnGroup: LeftBtnGroup;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mScene = scene;
        this.mWorld = world;
        this.mTopBtnGroup = new TopBtnGroup(scene, world);
        this.mRightBtnGroup = new RightBtnGroup(scene, world);
        this.mBottomBtnGroup = new BottomBtnGroup(scene, world);
        // app环境下没有全屏按钮
        if (world.getConfig().platform !== "app") this.mLeftBtnGroup = new LeftBtnGroup(scene, world);
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public show(param?: any) {
        if (this.mShowing) {
            return;
        }
        if (this.mTopBtnGroup) this.mTopBtnGroup.show(param);
        if (this.mRightBtnGroup) this.mRightBtnGroup.show(param);
        if (this.mBottomBtnGroup) this.mBottomBtnGroup.show(param);
        if (this.mLeftBtnGroup) this.mLeftBtnGroup.show(param);
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
    public tweenView(show: boolean) {
        if (this.mTopBtnGroup) this.mTopBtnGroup.tweenView(show);
        if (this.mRightBtnGroup) this.mRightBtnGroup.tweenView(show);
        if (this.mBottomBtnGroup) this.mBottomBtnGroup.tweenView(show);
        if (this.mLeftBtnGroup) this.mLeftBtnGroup.tweenView(show);
    }

    public getBottomView(): BottomBtnGroup {
        return this.mBottomBtnGroup;
    }

    public getLeftView(): LeftBtnGroup {
        return this.mLeftBtnGroup;
    }

    public getRightView(): RightBtnGroup {
        return this.mRightBtnGroup;
    }

    public getTopView(): TopBtnGroup {
        return this.mTopBtnGroup;
    }

    public setDataList(items: op_gameconfig.IItem[]) {
        if (this.mRightBtnGroup) this.mRightBtnGroup.refreshSlot();
    }
}
