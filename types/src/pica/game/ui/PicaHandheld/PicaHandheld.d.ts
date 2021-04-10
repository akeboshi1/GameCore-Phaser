import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { Game } from "gamecore";
export declare class PicaHandheld extends PacketHandler {
    private game;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryChangeHandheld(id: string): void;
    queryClearHandheld(): void;
    queryHandheldList(): void;
    private onRetHandheldList;
}
