import { IRoomService } from "..";
import { BaseStateManager } from "./base.state.manager";
export declare class RoomStateManager extends BaseStateManager {
    constructor(room: IRoomService);
    protected init(): void;
}
