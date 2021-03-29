import { op_client } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game, PlayerProperty, UIType } from "gamecore";
import { EventType, ModuleName } from "structure";
import { IJob } from "src/pica/structure/ijob";
import { BaseDataConfigManager } from "picaWorker";
import { PicaSurvey } from "./PicaSurvey";
import { ICountablePackageItem } from "picaStructure";
export class PicaSurveyMediator extends BasicMediator {
    protected mModel: PicaSurvey;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICASURVEY_NAME, game);
        this.mModel = new PicaSurvey(game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICASURVEY_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        this.game.emitter.on(ModuleName.PICASURVEY_NAME + "_surveysuccess", this.onSurveySuccessHandler, this);
        //  this.game.emitter.on(EventType.EXECUTE_SURVEY_FURNITURE, this.onSurveySuccessHandler, this);
        this.cacheMgr.isSurveyStatus = true;
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICASURVEY_NAME + "_hide", this.hide, this);
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        this.game.emitter.off(ModuleName.PICASURVEY_NAME + "_surveysuccess", this.onSurveySuccessHandler, this);
        // this.game.emitter.off(EventType.EXECUTE_SURVEY_FURNITURE, this.onSurveySuccessHandler, this);
        this.cacheMgr.isSurveyStatus = false;
    }

    destroy() {
        this.mPlayerInfo = undefined;
        super.destroy();
    }

    panelInit() {
        super.panelInit();
        if (this.mShowData) {
            this.onSurveySuccessHandler(this.mShowData);
        }
    }
    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    private onUpdatePlayerInfo(content: PlayerProperty) {
        this.mPlayerInfo = content;
        // if (this.mView)
        //     this.mView.setWorkChance(content.workChance.value);
    }

    private onSurveySuccessHandler(id: string) {
        const config = <BaseDataConfigManager>this.game.configManager;
        this.mShowData = config.getItemBaseByID(id);
        if (this.mPanelInit) this.mView.setSurveyData(this.mShowData);
    }

    private get cacheMgr() {
        const mgr = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        return mgr;
    }
}
