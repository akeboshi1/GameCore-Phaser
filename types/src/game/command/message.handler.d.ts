import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { EventDispatcher } from "utils";
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
    get emitter(): EventDispatcher;
}
