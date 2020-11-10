import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
export class ActivityMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.ACTIVITY_NAME, game);
        this.mUIType = UIType.Scene;
    }

    show(params?: any) {
        this.__exportProperty(() => {
            this.game.renderPeer.showPanel(this.key, params);
        });
    }

    isSceneUI() {
        return true;
    }
}
