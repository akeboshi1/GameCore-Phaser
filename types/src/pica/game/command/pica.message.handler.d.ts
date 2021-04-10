import { MessageHandler } from "gamecore";
import { PicaGame } from "../pica.game";
export declare class PicaMessageHandler extends MessageHandler {
    constructor(game: PicaGame);
    protected onAddListener(): void;
    protected onRemoveListener(): void;
}
