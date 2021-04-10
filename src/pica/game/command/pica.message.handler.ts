import { MessageHandler } from "gamecore";
import { PicaGame } from "../pica.game";

export class PicaMessageHandler extends MessageHandler {
    constructor(game: PicaGame) {
        super(game);
        this.addPackListener();
    }
    protected onAddListener() {

    }

    protected onRemoveListener() {

    }
}
