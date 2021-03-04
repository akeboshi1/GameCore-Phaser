import { EventType, ModuleName } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class FuritElementAction extends ElementBaseAction {
    public actionTag: string = "frozenType";
    public executeAction() {
        const tag = this.getActionData();
        if (tag === "FROZEN") {
            const uiName = ModuleName.PICAFURNIFUN_NAME;
            const obj = { nickname: this.data.nickname, displayInfo: this.data.displayInfo, sn: this.data.sn };
            this.game.emitter.emit(EventType.SCENE_SHOW_UI, uiName, obj);
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
