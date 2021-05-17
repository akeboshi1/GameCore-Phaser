import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaNewOrder } from "./PicaNewOrder";
import { BasicMediator } from "gamecore";
import { ModuleName } from "structure";
import { PicaGame } from "../../pica.game";
import { BaseDataConfigManager } from "../../config";
import { ObjectAssign } from "utils";
export class PicaNewOrderMediator extends BasicMediator {

    private mListData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST = null;
    private mProgressData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS = null;

    constructor(game: PicaGame) {
        super(ModuleName.PICANEWORDER_NAME, game);
        this.mModel = new PicaNewOrder(game);
        this.game.emitter.on(this.key + "_modelQuestlist", this.on_ORDER_LIST, this);
        this.game.emitter.on(this.key + "_modelProgresslist", this.on_PLAYER_PROGRESS, this);
    }

    isSceneUI() {
        return false;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.on(this.key + "_changeorder", this.query_CHANGE_ORDER_STAGE, this);
        this.game.emitter.on(this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.on(this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.on(this.key + "_hide", this.onHideView, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.off(this.key + "_changeorder", this.query_CHANGE_ORDER_STAGE, this);
        this.game.emitter.off(this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.off(this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.off(this.key + "_hide", this.onHideView, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off(this.key + "_modelQuestlist", this.on_ORDER_LIST, this);
        this.game.emitter.off(this.key + "_modelProgresslist", this.on_PLAYER_PROGRESS, this);
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        if (this.mListData) {
            this.on_ORDER_LIST(this.mListData);
            this.mListData = null;
        }
        if (this.mProgressData) {
            this.on_PLAYER_PROGRESS(this.mProgressData);
            this.mProgressData = null;
        }
    }

    get playerData() {
        const user = this.game.user;
        if (!user || !user.userData) {
            return;
        }
        return user.userData.playerBag;
    }

    private query_ORDER_LIST() {
        this.model.query_ORDER_LIST();
    }
    private query_CHANGE_ORDER_STAGE(obj: { index: number, orderOperator: op_pkt_def.PKT_Order_Operator }) {
        this.model.query_CHANGE_ORDER_STAGE(obj.index, obj.orderOperator);
    }
    private query_PLAYER_PROGRESS() {
        this.model.query_PLAYER_PROGRESS("order");
    }

    private query_PLAYER_PROGRESS_REWARD(index: number) {
        this.model.query_PLAYER_PROGRESS_REWARD(index);
    }
    private on_ORDER_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST) {
        const list = content.orders;
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        for (const order of list) {
            const temp = configMgr.getQuest(order.id);
            ObjectAssign.excludeAllAssign(order, temp);
            order.display = { texturePath: "pkth5/npc/task_head_npc_1" };
            order["servertime"] = this.game.clock.unixTime / 1000;
            const materials = order.targets;
            configMgr.getBatchItemDatas(materials);
            configMgr.getBatchItemDatas(order.rewards);
            if (materials) {
                for (const material of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, material.id, material.subcategory);
                    material.count = count;
                }
            }
        }
        if (!this.mPanelInit) {
            this.mListData = content;
            return;
        }
        if (this.mView && content) {
            this.mView.setOrderDatas(content);
        }
    }

    private on_PLAYER_PROGRESS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        if (!this.mPanelInit) {
            this.mProgressData = content;
            return;
        }
        if (this.mView && content) {
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const steps = content.steps;
            for (const step of steps) {
                configMgr.getBatchItemDatas(step.rewards);
            }
            this.mView.setOrderProgress(content);
        }
    }

    private onHideView() {
        this.hide();
    }

    private get model(): PicaNewOrder {
        return (<PicaNewOrder>this.mModel);
    }
}
