import { EventType } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class FuritElementAction extends ElementBaseAction {
    public actionTag: string = "frozenType";
    public executeAction() {
        const tag = this.getActionData();
        if (tag === "FROZEN") {
            const uiName = "PicaFurniFun";
            this.game.emitter.emit(EventType.SCENE_SHOW_UI, uiName, this.data);
        }
    }
    getActionData() {
        const data = this.data;
        const tag = this.actionTag;
        if (data && data.attrs) {
            const attrs = data.attrs;
            for (const att of attrs) {
                if (att.key === tag) {
                    return att.value;
                }
            }
        }
        return undefined;
    }
}