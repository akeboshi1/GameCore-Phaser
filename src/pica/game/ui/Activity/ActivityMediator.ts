import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
export class ActivityMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.ACTIVITY_NAME, game);
        this.mUIType = UIType.Scene;
    }

    show(params?: any) {
        super.show(params);
    }

    isSceneUI() {
        return true;
    }
}
