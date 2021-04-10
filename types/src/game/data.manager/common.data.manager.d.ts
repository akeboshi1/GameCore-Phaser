import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
export declare class CommonDataManager extends BasePacketHandler {
    constructor(game: Game, event?: EventDispatcher);
    clear(): void;
    destroy(): void;
    private on_ALL_CHAPTER_PROGRESS;
}
