import { op_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { PicaRepairChoose } from "./PicaRepairChoose";
export class PicaRepairChooseMediator extends BasicMediator {
    protected mModel: PicaRepairChoose;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICAREPAIRCHOOSE_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaRepairChoose(game, this.mScneType);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_querychange", this.onQueryChangeHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_querychange", this.onQueryChangeHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        super.hide();
        this.cache.queryUnlockFurinture = false;
        if (this.cache.roomUpgradeState) {
            this.game.showMediator(ModuleName.PICAROOMUPGRADE_NAME, true, this.cache.roomUpgradeState);
        }
    }

    protected panelInit() {
        super.panelInit();
        if (this.mPanelInit) {
            if (this.mView) {
                this.setFurnitureGroup();
            }
        }
        this.onViewInitComplete();
    }

    private onCloseHandler() {
        this.hide();
        this.onHideView();
    }

    private onQueryChangeHandler(data: { element_id: number, target_type: string }) {
        this.mModel.queryChange(this.mShowData.id, data.target_type);
        this.onCloseHandler();
    }

    private setFurnitureGroup() {
        if (!this.mPanelInit) return;
        this.mView.setChooseData(this.mShowData.group);
    }
    private get configMgr() {
        return <BaseDataConfigManager>this.game.configManager;
    }
    private onHideView() {
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.BOTTOM);
        this.destroy();
    }
    private onViewInitComplete() {
        const uimanager = this.game.uiManager;
        uimanager.hideMed(ModuleName.BOTTOM);
    }
    private get cache() {
        return this.game.getDataMgr<CacheDataManager>(DataMgrType.ChatMgr);
    }
}
