import { CacheDataManager, DataMgrType } from "gamecore";
import { EventType, ModuleName } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class PicaFurniSurveyAction extends ElementBaseAction {
    public actionTag: string = "FurniSurvey";
    public executeAction() {
        if (this.data.nodeType === 3 && this.getActionData("frozenType") === "FROZEN") {
            return false;
        }
        const cache = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        if (!cache.isSurveyStatus) return;
        const item = (<any>this.game.configManager).getItemBaseBySN(this.data.sn);
        this.game.emitter.emit(EventType.QUERY_SURVEY_FURNITURE, this.data.id);
        // this.game.emitter.emit(EventType.EXECUTE_SURVEY_FURNITURE, item);
    }
}
