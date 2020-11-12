import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaOrder } from "./PicaOrder";
import { BasicMediator } from "gamecore";
import { ModuleName } from "structure";
import { PicaGame } from "../../pica.game";
export class PicaOrderMediator extends BasicMediator {
    private PicaOrder: PicaOrder;
    constructor(game: PicaGame) {
        super(ModuleName.PICAORDER_NAME, game);
        this.PicaOrder = new PicaOrder(game);
    }

    isSceneUI() {
        return true;
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAORDER_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.off(ModuleName.PICAORDER_NAME + "_changeorder", this.query_CHANGE_ORDER_STAGE, this);
        this.game.emitter.off(ModuleName.PICAORDER_NAME + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.off(ModuleName.PICAORDER_NAME + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.off(ModuleName.PICAORDER_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off("questlist", this.on_ORDER_LIST, this);
        this.game.emitter.off("progresslist", this.on_PLAYER_PROGRESS, this);
    }

    destroy() {
        if (this.PicaOrder) {
            this.PicaOrder.destroy();
            this.PicaOrder = undefined;
        }
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        this.game.emitter.on(ModuleName.PICAORDER_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.on(ModuleName.PICAORDER_NAME + "_changeorder", this.query_CHANGE_ORDER_STAGE, this);
        this.game.emitter.on(ModuleName.PICAORDER_NAME + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.on(ModuleName.PICAORDER_NAME + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.on(ModuleName.PICAORDER_NAME + "_hide", this.onHideView, this);
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
        this.PicaOrder.query_ORDER_LIST();
    }
    private query_CHANGE_ORDER_STAGE(obj: { index: number, orderOperator: op_pkt_def.PKT_Order_Operator }) {
        this.PicaOrder.query_CHANGE_ORDER_STAGE(obj.index, obj.orderOperator);
    }
    private query_PLAYER_PROGRESS() {
        this.PicaOrder.query_PLAYER_PROGRESS("order");
    }

    private query_PLAYER_PROGRESS_REWARD(index: number) {
        this.PicaOrder.query_PLAYER_PROGRESS_REWARD(index);
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
