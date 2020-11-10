import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";

export class CutInMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.CUTIN_NAME, game);
    }

    public show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(this.key, param);
        });
    }
}
