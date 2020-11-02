import { Game } from "../../game";
import { BasicMediator } from "../basic/basic.mediator";

export class CutInMediator extends BasicMediator {
    public static NAME: string = "CutIn";
    constructor(game: Game) {
        super(game);
    }

    public show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(CutInMediator.NAME, param);
        });
    }
}
