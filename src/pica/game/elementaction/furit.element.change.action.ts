
import { ElementBaseAction } from "gamecore";
import { EventType, ModuleName } from "structure";

export class FuritElementChangeAction extends ElementBaseAction {
    public actionTag: string = "FuritChange";
    public executeAction() {
        const group = (<any>this.game.configManager).getFurnitureGroupBySN(this.data.sn);
        if (group)
            this.game.emitter.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAREPAIRCHOOSE_NAME, group);
    }
}
