import { ElementBaseAction } from "gamecore";
import { EventType } from "structure";
export class PKTElementAction extends ElementBaseAction {
    public actionTag: string = "TQ_PKT_Action";
    public executeAction() {
        const value = this.getActionData();
        const data = value ? JSON.parse(value) : undefined;
        if (data && data.action === "ShowUI") {
            const senddata = data.data;
            const uiName = senddata.uiName;
            const tempdata = { data: senddata, id: data.id };
            this.game.emitter.emit(EventType.SCENE_SHOW_UI, uiName, tempdata);
        }
    }
}
