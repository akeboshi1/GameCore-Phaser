import { ElementDisplay } from "../display/element.display";
import { InputEnable } from "../element/element";
import { ISprite } from "../element/sprite";

export abstract class BlockObject {
    protected mDisplay?: ElementDisplay;
    protected mRenderable: boolean = false;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable = InputEnable.Diasble;
    constructor() {
    }

    public setRenderable(isRenderable: boolean, delay?: number) {
        if (this.mRenderable !== isRenderable) {
            delay = delay ? delay : 0;
            this.mRenderable = isRenderable;
            if (isRenderable) {
                this.addDisplay();
                if (delay > 0) {
                    this.fadeIn();
                }
                return;
            } else {
                if (delay > 0) {
                    this.fadeOut(() => {
                        this.removeDisplay();
                    });
                } else {
                    this.removeDisplay();
                }
            }
        }
    }

    public getRenderable() {
        return this.mRenderable;
    }

    public fadeIn(callback?: () => void) {
        if (!this.mDisplay) return;
        this.mDisplay.fadeIn(callback);
    }

    public fadeOut(callback?: () => void) {
        if (!this.mDisplay) return;
        this.mDisplay.fadeOut(callback);
    }

    public fadeAlpha(alpha: number) {
        if (!this.mDisplay) return;
        // this.mDisplay.alpha = alpha;
    }

    public setInputEnable(val: InputEnable) {
        if (this.mInputEnable !== val) {
            this.mInputEnable = val;
            if (this.mDisplay) {
                switch (val) {
                    case InputEnable.Interactive:
                        if (this.mModel && this.mModel.hasInteractive) {
                            this.mDisplay.setInteractive();
                        }
                        break;
                    case InputEnable.Enable:
                        this.mDisplay.setInteractive();
                        break;
                    default:
                        this.mDisplay.disableInteractive();
                        break;
                }
            }
        }
    }

    public destroy() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
    }

    protected addDisplay() {
    }

    protected removeDisplay() {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.removeFromParent();
    }

    protected addToBlock() {
    }

    protected updateBlock() {
    }

}
