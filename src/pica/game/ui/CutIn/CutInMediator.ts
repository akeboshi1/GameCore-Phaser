import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";

export class CutInMediator extends BasicMediator {
    public static NAME: string = ModuleName.CUTIN_NAME;
    constructor(game: Game) {
        super(game);
    }

    public show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(CutInMediator.NAME, param);
        });
    }
}
