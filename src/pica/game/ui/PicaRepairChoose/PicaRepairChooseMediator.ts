import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "picaWorker";
import { ObjectAssign } from "utils";
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
        // this.game.emitter.on(this.key + "_queryrecaste", this.queryRecaste, this);
        // this.game.emitter.on(this.key + "_queryrecastelist", this.queryFuriListByStar, this);
    }

    hide() {
        // this.game.emitter.off(this.key + "_retrecasteresult", this.onRetRescateHandler, this);
        // this.game.emitter.off(this.key + "_retrecastelistresult", this.onRetRescateListHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        super.hide();
    }

    destroy() {
        super.destroy();
    }

    protected panelInit() {
        if (this.panelInit) {
            if (this.mView) {
            }
        }
    }

    private onCloseHandler() {
        this.hide();
    }

    private onRetRescateHandler(reward: op_client.ICountablePackageItem) {
        if (this.mView) {
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const temp = configMgr.getItemBaseByID(reward.id);
            ObjectAssign.excludeTagAssign(reward, temp);
            this.mView.setRecasteResult(reward);
            const uimgr = this.game.uiManager;
            uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: [reward], type: "open" });
        }
    }

}
