import {IFramesModel} from "../display/frames.model";
import {FramesDisplay} from "../display/frames.display";
import {LayerManager} from "../layer/layer.manager";
import {IRoomService} from "../room";
import {Logger} from "../../utils/log";

export class MouseFollow {
    private mDisplay: FramesDisplay;
    private mLayerManager: LayerManager;
    constructor(private mScene: Phaser.Scene, private mRoomService: IRoomService) { }

    setDisplay(frame: IFramesModel) {
        if (!this.mScene) return;
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mLayerManager = this.mRoomService.layerManager;
        this.mDisplay = new FramesDisplay(this.mScene, this.mRoomService);
        this.mDisplay.load(frame);
        this.mDisplay.changeAlpha(0.8);
        this.mDisplay.once("initialized", this.onInitializedHandler, this);
        this.mLayerManager.addToSceneToUI(this.mDisplay);

        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
    }

    destroy() {
        if (this.mScene) this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
    }

    private onPointerMoveHandler(pointer) {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.x = pointer.x;
        this.mDisplay.y = pointer.y;
    }

    private onInitializedHandler() {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.showRefernceArea();
    }

    get display() {
        return this.mDisplay;
    }
}
