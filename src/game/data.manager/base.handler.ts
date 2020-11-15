import { PacketHandler } from "net-socket-packet";
import { EventDispatcher } from "utils";
import { Game } from "../game";

export class BaseHandler {
    protected mEvent: EventDispatcher;
    constructor(protected game: Game, event: EventDispatcher) {
        this.mEvent = event;
    }

    clear() {
        this.mEvent.offAll();
    }

    destroy() {
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
}