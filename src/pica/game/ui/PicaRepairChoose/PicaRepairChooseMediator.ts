import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "picaWorker";
import { ObjectAssign } from "utils";
import { PicaRepairChoose } from "./PicaRepairChoose";
import { IFurnitureGroup } from "picaStructure";

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
    }

    destroy() {
        super.destroy();
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

    private onQueryChangeHandler(data: { element_id: string, target_type: string }) {
        this.mModel.queryChange(data.element_id, data.target_type);
        this.onCloseHandler();
    }

    private setFurnitureGroup() {
        if (!this.mPanelInit) return;
        this.mView.setChooseData(this.mShowData);
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
}
