import { IRoomService } from "../../rooms/room";
import { Size } from "../../utils/size";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";
import { IBag } from "./basebag";
import { ItemSlot } from "./item.slot";

/**
 * 背包显示栏
 */
export class BagUIMobile implements IBag {
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];
    private mShowing: boolean;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mParentCon: Phaser.GameObjects.Container;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        this.mScene = scene;
        this.mWorld = world;
        const size: Size = this.mWorld.getSize();
        this.mParentCon = this.mScene.add.container(x, y);
        this.mParentCon.scaleX = this.mParentCon.scaleY = .3;
        // this.createPanel();
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public show() {
        if (this.mShowing) {
            // this.hide();
            return;
        }
        this.mShowing = true;
        this.createPanel();
    }
    public update() {

    }
    public hide() {
        this.destroy();
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.mParentCon.x = size.width - 10;
        this.mParentCon.y = size.height - 10;
    }
    public destroy() {

    }

    private createPanel() {
        this.mResStr = "joystick";
        this.mResPng = "./resources/ui/joystick/joystick.png";
        this.mResJson = "./resources/ui/joystick/joystick.json";
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, this.mResPng, this.mResJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        const mFrame: string = "btn";
        this.bagBtn = this.mScene.add.sprite(0, 0, this.mResStr, mFrame);
        this.mParentCon.add(this.bagBtn);
        this.mParentCon.setSize(this.bagBtn.width, this.bagBtn.height);
        this.mParentCon.setInteractive();
        this.mParentCon.on("pointerup", this.uiUp, this);
    }

    private uiUp(pointer, gameObject) {
        this.mScene.tweens.add({
            targets: this.mParentCon,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .2 },
                scaleY: { value: .2 },
            },
            yoyo: true,
            repeat: 0,
        });
        this.mParentCon.scaleX = this.mParentCon.scaleY = .3;
        // this.mWorld.uiManager.bagPanel.show(undefined);
    }
}
