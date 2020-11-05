import { PacketHandler } from "net-socket-packet";
import { Game } from "src/game/game";
import { EventDispatcher } from "utils";

export class BasicModel extends PacketHandler {
    protected event: EventDispatcher;
    constructor(protected game: Game) {
        super();
        this.event = game.dataManager.emitter;
    }

    register() {
    }

    unregister() {
    }

    destroy() {
    }
}
