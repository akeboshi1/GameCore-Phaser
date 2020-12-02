import { EventType } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class PlayerElementAction extends ElementBaseAction {
    public actionTag: string = "Player";
    public executeAction() {
        const uiName = "PicaNewRole";
        this.game.emitter.emit(EventType.SCENE_SHOW_UI, uiName, this.data.id);
    }
}
