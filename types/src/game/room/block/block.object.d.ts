import { IPos, IProjection } from "utils";
import { InputEnable } from "../element/element";
import { MatterObject } from "../physical/matter.object";
import { IRoomService } from "../room";
import { IBlockObject } from "./iblock.object";
import { ISprite } from "structure";
export declare abstract class BlockObject extends MatterObject implements IBlockObject {
    protected mRoomService: IRoomService;
    isUsed: boolean;
    protected mRenderable: boolean;
    protected mBlockable: boolean;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable;
    protected mCreatedDisplay: boolean;
    constructor(id: number, mRoomService: IRoomService);
    setRenderable(isRenderable: boolean, delay?: number): Promise<any>;
    getPosition(): IPos;
    getPosition45(): IPos;
    getRenderable(): boolean;
    fadeIn(callback?: () => void): Promise<any>;
    fadeOut(callback?: () => void): Promise<any>;
    fadeAlpha(alpha: number): void;
    setInputEnable(val: InputEnable): void;
    setBlockable(val: boolean): this;
    destroy(): void;
    clear(): void;
    disableBlock(): void;
    enableBlock(): void;
    getProjectionSize(): IProjection;
    protected addDisplay(): Promise<any>;
    protected createDisplay(): Promise<any>;
    protected removeDisplay(): Promise<any>;
    protected addToBlock(): Promise<any>;
    protected removeFromBlock(remove?: boolean): void;
    protected updateBlock(): void;
    get id(): number;
    get type(): number;
}
