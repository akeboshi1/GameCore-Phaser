import { IRoomService } from "..";
import { BaseStateManager } from "./state.manager";
export declare class RoomStateManager extends BaseStateManager {
    constructor(room: IRoomService);
    protected init(): void;
}
