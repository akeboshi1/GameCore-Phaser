import { Game } from "src/game/game";
import { ModuleName } from "structure";
import { BasicMediator, UIType } from "../basic/basic.mediator";
export class ActivityMediator extends BasicMediator {
    public static NAME: string = ModuleName.ACTIVITY_NAME;
    constructor(game: Game) {
        super(game);
        this.mUIType = UIType.Scene;
    }

    show(params?: any) {
        this.__exportProperty(() => {
            this.game.renderPeer.showPanel(ActivityMediator.NAME, params);
        });
    }

    isSceneUI() {
        return true;
    }
}
