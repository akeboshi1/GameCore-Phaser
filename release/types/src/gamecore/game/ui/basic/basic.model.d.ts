import { PacketHandler } from "net-socket-packet";
import { Game } from "../../game";
import { EventDispatcher } from "structure";
import { Connection } from "../../net";
export declare class BasicModel extends PacketHandler {
    protected game: Game;
    protected event: EventDispatcher;
    constructor(game: Game);
    get connection(): Connection;
    register(): void;
    unregister(): void;
    destroy(): void;
}
