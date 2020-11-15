import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { EventDispatcher } from "utils";
import { Game } from "../game";

export class BasePacketHandler extends PacketHandler {
    protected mEvent: EventDispatcher;
    constructor(protected game: Game) {
        super();
        this.mEvent = new EventDispatcher();
    }
    public addPackListener() {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }
    clear() {
        this.removePackListener();
        this.mEvent.offAll();
    }

    destroy() {
        this.removePackListener();
        this.game = undefined;
        this.mEvent = undefined;
    }
    on(event: string, fn: Function, context?: any) {
        this.mEvent.on(event, context, fn);
    }

    off(event: string, fn: Function, context?: any) {
        this.mEvent.off(event, context, fn);
    }

    emit(event: string, data?: any) {
        this.mEvent.emit(event, data);
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
}