import { Game } from "../game";

export class NewProtoHandler {
    constructor(protected game: Game) {
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
        this.onAddListener();
    }

    protected removePackListener() {
        this.onAddListener();
    }

    protected onAddListener() {
    }

    protected onRemoveListener() {

    }

    get emitter() {
        return this.game.emitter;
    }
    get proto() {
        return this.game.customProto;
    }
}
