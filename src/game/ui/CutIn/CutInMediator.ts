import { Game } from "../../game";
import { BasicMediator } from "../basic/basic.mediator";

export class CutInMediator extends BasicMediator {
    constructor(game: Game) {
        super(game);
    }

    public show() {
        this.__exportProperty(() => {

        });
    }
}
