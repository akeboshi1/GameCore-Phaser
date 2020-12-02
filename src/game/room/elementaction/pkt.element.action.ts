import { EventType } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class PKTElementAction extends ElementBaseAction {
    public actionTag: string = "TQ_PKT_Action";
    public executeAction() {
        const data = this.getActionData();
        if (data && data.action === "ShowUI") {
            const senddata = data.data;
            const uiName = senddata.uiName;
            const tempdata = { data: senddata, id: data.id };
            this.game.emitter.emit(EventType.SCENE_SHOW_UI, uiName, tempdata);
        }
    }
}
