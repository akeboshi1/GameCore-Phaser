import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "picaWorker";
import { PicaIllustrated } from "./PicaIllustrated";

export class PicaIllustratedMediator extends BasicMediator {
    protected mModel: PicaIllustrated;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICAILLUSTRATED_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaIllustrated(game, this.mScneType);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_queryrewards", this.onQueryRewardsHandler, this);
        this.game.emitter.on(this.key + "_openmake", this.onShowMakePanel, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(EventType.GALLERY_UPDATE, this.setGallaryData, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_queryrewards", this.onQueryRewardsHandler, this);
        this.game.emitter.off(this.key + "_openmake", this.onShowMakePanel, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(EventType.GALLERY_UPDATE, this.setGallaryData, this);
        super.hide();
    }

    destroy() {
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        if (this.mPanelInit) {
            if (this.mView) {
                this.setGallaryData();
            }
        }
    }

    private onCloseHandler() {
        this.hide();
    }

    private onQueryRewardsHandler(type: number) {
        this.mModel.query_GALLARY_PROGRESS_REWARD(type);
        this.onCloseHandler();
    }

    private setGallaryData() {
        if (!this.mPanelInit) return;
        const cache: CacheDataManager = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        this.mShowData = cache.gallery;
        this.mView.setGallaryData(this.mShowData);
    }

    private onShowMakePanel() {
        const uiManager = this.game.uiManager;
        uiManager.showMed(ModuleName.PICAMANUFACTURE_NAME);
        this.onCloseHandler();
    }
}
