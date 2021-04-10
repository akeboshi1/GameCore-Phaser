import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { EventDispatcher } from "utils";
import { Game } from "../game";

export class MessageHandler extends PacketHandler {
    constructor(protected game: Game) {
        super();
        this.addPackListener();
    }
    clear() {
        this.removePackListener();
    }

    destroy() {
        this.clear();
        this.game = undefined;
    }

    emit(event: string, data?: any) {
        this.emitter.emit(event, data);
    }
    protected addPackListener() {
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.onAddListener();
        }
    }

    protected removePackListener() {
        if (this.connection) {
            this.connection.removePacketListener(this);
            this.onRemoveListener();
        }
    }

    protected onAddListener() {

    }

    protected onRemoveListener() {

    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
    get emitter() {
        return this.game.emitter;
    }
}
