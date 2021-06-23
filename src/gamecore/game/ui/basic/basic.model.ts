import { PacketHandler } from "net-socket-packet";
import { Game } from "../../game";
import { EventDispatcher } from "structure";
import { Connection } from "../../net";
import { Export } from "webworker-rpc";

export class BasicModel extends PacketHandler {
    protected event: EventDispatcher;
    constructor(protected game: Game) {
        super();
        this.event = game.dataControlManager.emitter;
    }
    @Export()
    get connection(): Connection {
        if (this.game) {
            // @ts-ignore
            return this.game.connection;
        }
    }
    @Export()
    register() {
    }
    @Export()
    unregister() {
    }
    @Export()
    destroy() {
    }
}
