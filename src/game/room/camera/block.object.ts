import { IPos, LogicPos } from "../../../utils/logic.pos";
import { ISprite } from "../display/sprite/isprite";
import { InputEnable } from "../element/element";
import { IRoomService } from "../room";
import { IBlockObject } from "./iblock.object";

export abstract class BlockObject implements IBlockObject {
    public isUsed = false;
    protected mRenderable: boolean = false;
    protected mBlockable: boolean = true;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable;
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

    public getPosition(): IPos {
        const pos: LogicPos = this.mModel ? this.mModel.pos : new LogicPos();
        return pos;
    }

    public getPosition45(): IPos {
        const pos = this.getPosition();
        if (!pos) return new LogicPos();
        return this.mRoomService.transformTo45(pos);
    }

    public getRenderable() {
        return this.mRenderable;
    }

    public fadeIn(callback?: () => void) {
        this.mRoomService.world.peer.render.fadeIn(this.id, this.type);
    }

    public fadeOut(callback?: () => void) {
        this.mRoomService.world.peer.render.fadeOut(this.id, this.type);
    }

    public fadeAlpha(alpha: number) {
        this.mRoomService.world.peer.render.fadeAlpha(this.id, this.type, alpha);
    }

    public setInputEnable(val: InputEnable) {
        // if (this.mInputEnable !== val) {
        this.mInputEnable = val;
        switch (val) {
            case InputEnable.Interactive:
                if (this.mModel && this.mModel.hasInteractive) {
                    this.mRoomService.world.peer.render.setInteractive(this.id, this.type);
                }
                break;
            case InputEnable.Enable:
                this.mRoomService.world.peer.render.setInteractive(this.id, this.type);
                break;
            default:
                this.mRoomService.world.peer.render.disableInteractive(this.id, this.type);
                break;

        }
        // }
    }

    public setBlockable(val: boolean): this {
        if (this.mBlockable !== val) {
            this.mBlockable = val;
            if (this.mRoomService) {
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
        this.mRoomService.world.peer.render.displayDestroy(this.id, this.type);
    }

    public clear() {
        this.isUsed = false;
    }

    protected addDisplay() { }

    protected removeDisplay() {
        this.mRoomService.world.peer.render.removeDisplay(this.id, this.type);
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

    get type(): number {
        return -1;
    }
}
