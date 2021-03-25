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
        // this.game.emitter.on(this.key + "_queryrecastelist", this.queryFuriListByStar, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_querychange", this.onQueryChangeHandler, this);
        // this.game.emitter.off(this.key + "_retrecastelistresult", this.onRetRescateListHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        super.hide();
    }

    destroy() {
        super.destroy();
    }

    protected panelInit() {
        if (this.mPanelInit) {
            if (this.mView) {
                this.setFurnitureGroup();
            }
        }
    }

    private onCloseHandler() {
        this.hide();
    }

    private onQueryChangeHandler(element_id: string, target_type: string) {
        this.mModel.queryChange(element_id, target_type);
    }

    private setFurnitureGroup() {
        if (this.mPanelInit) return;
        const group: IFurnitureGroup = this.configMgr.getFurnitureGroup(this.mShowData);
        this.mView.setChooseData(group);
    }
    private get configMgr() {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
