import { ElementDisplay } from "../display/element.display";

export abstract class BlockObject {
    protected mDisplay?: ElementDisplay;
    protected mRenderable: boolean = false;
    protected mInputEnable: boolean = false;
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

    public setInputEnable(val: boolean) {
        if (this.mInputEnable !== val) {
            this.mInputEnable = val;
            if (this.mDisplay) {
                if (val) {
                    this.mDisplay.setInteractive();
                } else {
                    this.mDisplay.disableInteractive();
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
