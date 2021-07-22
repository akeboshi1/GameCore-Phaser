import { IPos } from "structure";
import { IRoomService } from "..";
import { Wall } from "../wall/wall";
export declare class WallManager {
    protected roomService: IRoomService;
    protected walls: Wall[];
    constructor(roomService: IRoomService);
    init(): void;
    destroy(): void;
    isInWallRect(pos: IPos): boolean;
    isAgainstWall(pos: IPos, originPoint: IPos): boolean;
}
