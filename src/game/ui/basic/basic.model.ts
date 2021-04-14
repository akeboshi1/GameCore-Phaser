import { PacketHandler } from "net-socket-packet";
import { Game } from "../../game";
import { EventDispatcher } from "utils";
import { Connection } from "src/game/net";

export class BasicModel extends PacketHandler {
    protected event: EventDispatcher;
    constructor(protected game: Game) {
        super();
        this.event = game.dataManager.emitter;
    }

    get connection(): Connection {
        if (this.game) {
            // @ts-ignore
            return this.game.connection;
        }
    }

    register() {
    }

    unregister() {
    }

    destroy() {
    }
}
