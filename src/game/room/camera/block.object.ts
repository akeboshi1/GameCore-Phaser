import { LogicPos } from "../../../utils/logic.pos";
import { ISprite } from "../display/sprite/isprite";
import { IRoomService } from "../room";
import { IBlockObject } from "./iblock.object";

export abstract class BlockObject implements IBlockObject {
    public isUsed = false;
    protected mRenderable: boolean = false;
    protected mBlockable: boolean = true;
    protected mModel: ISprite;
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

    public getPosition(): LogicPos {
        const pos: LogicPos = this.mModel ? this.mModel.pos : new LogicPos();
        return pos;
    }

    public getPosition45(): LogicPos {
        const pos = this.getPosition();
        if (!pos) return new LogicPos();
        return this.mRoomService.transformTo45(pos);
    }

    public getRenderable() {
        return this.mRenderable;
    }

    public fadeIn(callback?: () => void) {
        this.mRoomService.world.fadeIn(callback);
    }

    public fadeOut(callback?: () => void) {
        this.mRoomService.world.fadeOut(callback);
    }

    public fadeAlpha(alpha: number) {
        this.mRoomService.world.fadeAlpha(alpha);
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

    protected removeFromBlock(remove?: boolean) {
        if (this.mBlockable) {
            this.mRoomService.removeBlockObject(this);
            if (remove) {
                this.setRenderable(false);
            }
        }
    }

    protected updateBlock() {
        if (this.mBlockable) {
            this.mRoomService.updateBlockObject(this);
        }
    }

    protected disableBlock() {
        this.removeFromBlock();
        this.mBlockable = false;
        this.mRenderable = false;
    }

    protected enableBlock() {
        this.mBlockable = true;
        this.addToBlock();
    }

    get id(): number {
        return -1;
    }
}
