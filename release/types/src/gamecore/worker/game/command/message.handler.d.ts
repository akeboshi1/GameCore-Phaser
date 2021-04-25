import { ConnectionService } from "structure";
import { PacketHandler } from "net-socket-packet";
import { Game } from "../game";
export declare class MessageHandler extends PacketHandler {
    protected game: Game;
    constructor(game: Game);
    clear(): void;
    destroy(): void;
    emit(event: string, data?: any): void;
    protected addPackListener(): void;
    protected removePackListener(): void;
    protected onAddListener(): void;
    protected onRemoveListener(): void;
    get connection(): ConnectionService;
    get emitter(): import("../../../../structure").EventDispatcher;
}
