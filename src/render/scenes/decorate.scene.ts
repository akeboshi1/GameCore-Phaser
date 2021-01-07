import { PlayScene } from "./play.scene";
import { ModuleName, SceneName } from "structure";
import { Logger } from "utils";
import { DecorateManager } from "../input/decorate.manager";

export class DecorateScene extends PlayScene {
    private mDecorateManager: DecorateManager;
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: SceneName.DECORATE_SCENE });
    }

    // public create() {
    //     super.create();
    //     this.onLoadCompleteHandler();
    // }

    // protected onLoadCompleteHandler() {
    //     Logger.getInstance().log("decorateload complete");
    //     this.load.off(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
    // }

    protected initListener() {
        this.input.on("pointerup", this.onPointerUpHandler, this);
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("gameobjectdown", this.onGameobjectDownHandler, this);
        // this.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);

    }

    protected initInput() {
        this.mDecorateManager = new DecorateManager(this, this.render);
    }

    protected onGameobjectDownHandler(pointer, gameobject) {
        if (!gameobject) {
            return;
        }
        const id = gameobject.getData("id");
        //  const decorate = this.render.mainPeer[ModuleName.PICADECORATE_NAME];
        if (!id) {
            return;
        }
        this.mDecorateManager.setElement(id);
        //  decorate.setElement(id);
    }

    protected onPointerUpHandler(pointer) {
        super.onPointerUpHandler(pointer);
        this.mDecorateManager.selecting = false;
    }

    protected onGameobjectUpHandler(pointer) {
        this.removePointerMoveHandler();
        this.mDecorateManager.selecting = false;
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        const isSelecting = this.mDecorateManager.isDragging();
        if (!isSelecting) {
            this.render.camerasManager.offsetScroll(
                pointer.prevPosition.x - pointer.position.x,
                pointer.prevPosition.y - pointer.position.y
            );
            return;
        }
        if (pointer.downX === pointer.x && pointer.downY === pointer.y) {
            return;
        }
        this.mDecorateManager.moveElement(pointer);
    }
}
