import { IPos } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";
export declare class EmptyTerrain extends BlockObject {
    pos: IPos;
    dirty: boolean;
    constructor(room: IRoomService, pos: IPos, i: any, j: any);
    setPosition(pos: IPos): void;
    getPosition(): IPos;
    addDisplay(): Promise<any>;
    removeDisplay(): Promise<any>;
    drawBody(): void;
    destroy(): void;
}
