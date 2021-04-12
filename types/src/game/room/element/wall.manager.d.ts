import { IRoomService } from "..";
export declare class WallManager {
    private roomService;
    private walls;
    constructor(roomService: IRoomService);
    init(): void;
    destroy(): void;
}
