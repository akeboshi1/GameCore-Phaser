import { PacketHandler } from "net-socket-packet";
import { Game } from "../../game";
import { EventDispatcher } from "utils";
export declare class BasicModel extends PacketHandler {
    protected game: Game;
    protected event: EventDispatcher;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
}
