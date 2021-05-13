import { IRoomService } from "../room";
import * as SAT from "sat";
export declare class CollsionManager {
    private roomService;
    private debug;
    private borders;
    constructor(roomService: IRoomService);
    add(id: number, boder: SAT.Polygon): void;
    remove(id: number): void;
    collideObjects(body: SAT.Polygon): SAT.Response[];
    update(time: number, delta: number): void;
    addWall(): void;
    v(): void;
    q(): void;
    destroy(): void;
}
