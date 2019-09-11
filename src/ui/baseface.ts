import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";
import { WorldService } from "../game/world.service";
import { Logger } from "../utils/log";

export class BaseFace {
    private mBtn: Phaser.GameObjects.Sprite;

    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private parentCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService) {
        this.mScene = scene;
        this.mWorld = world;
        const size: Size = this.mWorld.getSize();
        this.parentCon = this.mScene.add.container(size.width - 100, size.height - 100);
        this.createView();
    }

    private createView() {
        if (!this.mScene.cache.obj.has("joystick")) {
            this.mScene.load.atlas("joystick", "resources/joystick.png", "resources/joystick.json");
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        this.mBtn = this.mScene.add.sprite(0, 0, "joystick", "btn");
        this.parentCon.add(this.mBtn);
        this.parentCon.setSize(this.mBtn.width, this.mBtn.height);
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
