import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicOrder } from "./PicOrder";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
export class PicOrderMediator extends BasicMediator {
    private picOrder: PicOrder;
    constructor(game: Game) {
        super(ModuleName.PICORDER_NAME, game);
        this.picOrder = new PicOrder(game);
    }

    isSceneUI() {
        return true;
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICORDER_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.off(ModuleName.PICORDER_NAME + "_changeorder", this.query_CHANGE_ORDER_STAGE, this);
        this.game.emitter.off(ModuleName.PICORDER_NAME + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.off(ModuleName.PICORDER_NAME + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.off(ModuleName.PICORDER_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off("questlist", this.on_ORDER_LIST, this);
        this.game.emitter.off("progresslist", this.on_PLAYER_PROGRESS, this);
    }

    destroy() {
        if (this.picOrder) {
            this.picOrder.destroy();
            this.picOrder = undefined;
        }
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        this.game.emitter.on(ModuleName.PICORDER_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.on(ModuleName.PICORDER_NAME + "_changeorder", this.query_CHANGE_ORDER_STAGE, this);
        this.game.emitter.on(ModuleName.PICORDER_NAME + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.on(ModuleName.PICORDER_NAME + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.on(ModuleName.PICORDER_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on("questlist", this.on_ORDER_LIST, this);
        this.game.emitter.on("progresslist", this.on_PLAYER_PROGRESS, this);
        this.query_ORDER_LIST();
        // if (this.mView) this.mView.setOrderDataList(this.mShowData);
    }

    get playerData() {
        const user = this.game.user;
        if (!user || !user.userData) {
            return;
        }
        return user.userData.playerBag;
    }

    private query_ORDER_LIST() {
        this.picOrder.query_ORDER_LIST();
    }
    private query_CHANGE_ORDER_STAGE(obj: { index: number, orderOperator: op_pkt_def.PKT_Order_Operator }) {
        this.picOrder.query_CHANGE_ORDER_STAGE(obj.index, obj.orderOperator);
    }
    private query_PLAYER_PROGRESS() {
        this.picOrder.query_PLAYER_PROGRESS("order");
    }

    private query_PLAYER_PROGRESS_REWARD(index: number) {
        this.picOrder.query_PLAYER_PROGRESS_REWARD(index);
    }
    private on_ORDER_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST) {
        const list = content.orders;
        for (const order of list) {
            const materials = order.targets;
            if (materials) {
                for (const material of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, material.id, material.subcategory);
                    material.count = count;
                }
            }
        }
        if (!this.mPanelInit) {
            return;
        }
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICHANDHELD_NAME];
        if (this.mView && content) {
            this.mView.setOrderDataList(content);
        }
    }

    private on_PLAYER_PROGRESS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        if (!this.mPanelInit) {
            return;
        }
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICHANDHELD_NAME];
        if (this.mView && content) {
            this.mView.setOrderProgress(content);
        }
    }

    private onHideView() {
        this.hide();
    }
}
