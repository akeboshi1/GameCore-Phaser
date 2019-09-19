import { IRoomService } from "../../rooms/room";
import { Size } from "../../utils/size";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";
import { IAbstractPanel } from "../abstractPanel";
import { IBag } from "./basebag";
import { ItemSlot } from "./item.slot";

/**
 * 背包显示栏
 */
export class BagPanelMobile implements IAbstractPanel, IBag {
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];

    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private parentCon: Phaser.GameObjects.Container;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        this.mScene = scene;
        this.mWorld = world;
        const size: Size = this.mWorld.getSize();
        this.parentCon = this.mScene.add.container(x, y);
        this.createPanel();
    }

    public createPanel() {
        this.mResStr = "joystick";
        this.mResPng = "resources/ui/joystick/joystick.png";
        this.mResJson = "resources/ui/joystick/joystick.json";
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, this.mResPng, this.mResJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    public show() {

    }
    public close() {

    }
    public resize() {

    }
    public destroy() {

    }

    private onLoadCompleteHandler() {
        const mFrame: string = "btn";
        this.bagBtn = this.mScene.add.sprite(0, 0, this.mResStr, mFrame);
        this.parentCon.add(this.bagBtn);
        this.parentCon.setSize(this.bagBtn.width, this.bagBtn.height);
        this.parentCon.setInteractive();
        this.parentCon.on("pointerdown", this.uiDown, this);
        this.parentCon.on("pointerup", this.uiUp, this);
    }

    private uiDown(pointer, gameObject) {
        this.parentCon.scaleX = this.parentCon.scaleY = .8;
        Logger.log("btnClick");
    }

    private uiUp(pointer, gameObject) {
        this.parentCon.scaleX = this.parentCon.scaleY = 1;
    }

    // todo resize
}
