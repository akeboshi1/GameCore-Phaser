import {IFramesModel} from "../display/frames.model";
import {FramesDisplay} from "../display/frames.display";

export class MouseFollow {
    private mDisplay: FramesDisplay;
    constructor(private mScene: Phaser.Scene) { }

    setDisplay(frame: IFramesModel) {
        if (!this.mScene) return;
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mDisplay = new FramesDisplay(this.mScene);
        this.mDisplay.load(frame);
        this.mDisplay.changeAlpha(0.8);

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

    get display() {
        return this.mDisplay;
    }
}
