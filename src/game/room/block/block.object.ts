import { IPos, LogicPos, IProjection, Logger } from "utils";
import { InputEnable } from "../element/element";
import { MatterObject } from "../physical/matter.object";
import { IRoomService } from "../room/room";
import { IBlockObject } from "./iblock.object";
import { ISprite } from "structure";

export abstract class BlockObject extends MatterObject implements IBlockObject {
    public isUsed = false;
    protected mRenderable: boolean = false;
    protected mBlockable: boolean = false;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable;
    protected mCreatedDisplay: boolean;
    constructor(id: number, protected mRoomService: IRoomService) {
        super(id, mRoomService);
        this.isUsed = true;
    }

    public async setRenderable(isRenderable: boolean, delay: number = 0): Promise<any> {
        if (this.mRenderable !== isRenderable) {
            this.mRenderable = isRenderable;
            if (isRenderable) {
                await this.addDisplay();
                if (delay > 0) {
                    return this.fadeIn();
                }
            } else {
                if (delay > 0) {
                    this.fadeOut(() => {
                        return this.removeDisplay();
                    });
                } else {
                    return this.removeDisplay();
                }
            }
        }
    }

    public getPosition(): IPos {
        const pos: IPos = this.mModel && this.mModel.pos ? this.mModel.pos : new LogicPos();
        return pos;
    }

    public getPosition45(): IPos {
        const pos = this.getPosition();
        if (!pos) return new LogicPos();
        return this.mRoomService.transformToMini45(pos);
    }

    public getRenderable() {
        return this.mRenderable;
    }

    public fadeIn(callback?: () => void): Promise<any> {
        return this.mRoomService.game.peer.render.fadeIn(this.id, this.type);
    }

    public fadeOut(callback?: () => void): Promise<any> {
        return this.mRoomService.game.peer.render.fadeOut(this.id, this.type);
    }

    public fadeAlpha(alpha: number) {
        this.mRoomService.game.peer.render.fadeAlpha(this.id, this.type, alpha);
    }

    public setInputEnable(val: InputEnable) {
        // if (this.mInputEnable !== val) {
        this.mInputEnable = val;
        if (!this.mRoomService) return;
        switch (val) {
            case InputEnable.Interactive:
                if (this.mModel && this.mModel.hasInteractive) {
                    this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
                } else {
                    this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
                }
                break;
            case InputEnable.Enable:
                this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
                break;
            default:
                this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
                break;

        }
        // }
    }

    public setBlockable(val: boolean): this {
        if (this.mBlockable !== val) {
            this.mBlockable = val;
            if (this.mRoomService) {
                if (val) {
                    // Logger.getInstance().debug("block addBlockObject");
                    this.mRoomService.addBlockObject(this);
                } else {
                    // Logger.getInstance().debug("block removeBlockObject");
                    this.mRoomService.removeBlockObject(this);
                }
            }
        }
        return this;
    }

    public destroy() {
        // this.mRoomService.game.peer.render.displayDestroy(this.id, this.type);
    }

    public clear() {
        this.isUsed = false;
    }

    public disableBlock() {
        this.removeFromBlock();
        this.mBlockable = false;
        this.mRenderable = false;
    }

    public enableBlock() {
        this.mBlockable = true;
        this.addToBlock();
    }

    public getProjectionSize(): IProjection {
        const miniSize = this.mRoomService.miniSize;
        const collision = this.mModel.getCollisionArea();
        const origin = this.mModel.getOriginPoint();
        if (!collision) return;
        const rows = collision.length;
        const cols = collision[0].length;
        const width = cols;
        const height = rows;
        const offset = this.mRoomService.transformToMini90(new LogicPos(origin.x, origin.y));
        return { offset, width, height };
    }

    protected addDisplay(): Promise<any> {
        if (this.mCreatedDisplay) return;
        return this.createDisplay();
    }

    protected createDisplay(): Promise<any> {
        this.mCreatedDisplay = true;
        return Promise.resolve();
    }

    protected removeDisplay(): Promise<any> {
        // Logger.getInstance().debug("removeDisplay ====>", this);
        this.mCreatedDisplay = false;
        if (!this.mRoomService) return;
        this.removeBody();
        return this.mRoomService.game.peer.render.removeBlockObject(this.id);
    }

    protected addToBlock(): Promise<any> {
        if (this.mBlockable) {
            return this.mRoomService.addBlockObject(this).then((resolve) => {
                return Promise.resolve();
            });

        } else {
            this.addDisplay();
            return Promise.resolve();
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

    get id(): number {
        return -1;
    }

    get type(): number {
        return -1;
    }
}
