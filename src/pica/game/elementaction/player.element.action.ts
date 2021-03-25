import { ElementBaseAction } from "gamecore";
import { EventType } from "structure";

export class PlayerElementAction extends ElementBaseAction {
    public actionTag: string = "Player";
    public executeAction() {
        const uiName = "PicaNewRole";
        this.game.emitter.emit(EventType.SCENE_SHOW_UI, uiName, this.data.sn);
    }
}
