import { ElementDisplay } from "../display/element.display";
import { InputEnable } from "../element/element";
import { ISprite } from "../element/sprite";
import { Pos } from "../../utils/pos";
import { IRoomService } from "../room";

export interface IBlockObject {
    readonly id: number;

    getPosition(): Pos;

    getPosition45(): Pos;

    setRenderable(isRenderable: boolean, delay?: number): void;

    getRenderable(): boolean;

    setBlockable(val: boolean): this;
}
export abstract class BlockObject implements IBlockObject {
    public isUsed = false;
    protected mDisplay?: ElementDisplay;
    protected mRenderable: boolean = false;
    protected mBlockable: boolean = true;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable = InputEnable.Diasble;
    constructor(protected mRoomService: IRoomService) {
        this.isUsed = true;
    }

    public setRenderable(isRenderable: boolean, delay: number = 0) {
        if (this.mRenderable !== isRenderable) {
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

    public getPosition(): Pos {
        let pos: Pos;
        if (this.mDisplay) {
            pos = new Pos(this.mDisplay.x, this.mDisplay.y, this.mDisplay.z);
        } else {
            pos = new Pos();
        }
        return pos;
    }

    public getPosition45(): Pos {
        const pos = this.getPosition();
        if (!pos) return new Pos();
        return this.mRoomService.transformTo45(pos);
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
        // if (this.mInputEnable !== val) {
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
        // }
    }

    public setBlockable(val: boolean): this {
        if (this.mBlockable !== val) {
            this.mBlockable = val;
            if (this.mDisplay && this.mRoomService) {
                if (val) {
                    this.mRoomService.addBlockObject(this);
                } else {
                    this.mRoomService.removeBlockObject(this);
                }
            }
        }
        return this;
    }

    public destroy() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
    }

    public clear() {
        this.isUsed = false;
    }

    protected addDisplay() {}

    protected removeDisplay() {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.removeFromParent();
    }

    protected addToBlock() {
        if (this.mBlockable) {
            this.mRoomService.addBlockObject(this);
        } else {
            this.addDisplay();
        }
    }

    protected removeFromBlock() {
        if (this.mBlockable) {
            this.mRoomService.removeBlockObject(this);
        }
    }

    protected updateBlock() {
        if (this.mBlockable) {
            this.mRoomService.updateBlockObject(this);
        }
    }

    get id(): number {
        return -1;
    }
}
