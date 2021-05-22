
import { DisplayBaseAction } from "./display.base.action";
export class PlayerExplosiveAction extends DisplayBaseAction {
    public actionTag: string = "FuritChange";
    public executeAction() {
        if (this.data.nodeType === 3 && this.getActionData("frozenType") === "FROZEN") {
            return false;
        }
        // const group = (<any>this.game.configManager).getFurnitureGroupBySN(this.data.sn);
        // if (group)
        //     this.game.emitter.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAREPAIRCHOOSE_NAME, { id: this.data.id, group });
    }
}
