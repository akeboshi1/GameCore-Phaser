import { ConnectionService } from "src/structure/net";
import { PacketHandler } from "net-socket-packet";
import { EventDispatcher } from "structure";
import { Game } from "../game";
export declare class BasePacketHandler extends PacketHandler {
    protected game: Game;
    protected mEvent: EventDispatcher;
    constructor(game: Game, event: EventDispatcher);
    addPackListener(): void;
    removePackListener(): void;
    clear(): void;
    destroy(): void;
    on(event: string, fn: Function, context?: any): void;
    off(event: string, fn: Function, context?: any): void;
    emit(event: string, data?: any): void;
    get connection(): ConnectionService;
    get Event(): EventDispatcher;
}
