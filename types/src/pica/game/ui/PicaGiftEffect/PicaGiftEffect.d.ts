import { Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
export declare class PicaGiftEffect extends PacketHandler {
    private game;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
}
