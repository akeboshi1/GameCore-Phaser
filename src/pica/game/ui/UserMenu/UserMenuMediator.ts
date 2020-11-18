import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";

export class UserMenuMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.USERMENUMEDIATOR_NAME, game);
    }
}
