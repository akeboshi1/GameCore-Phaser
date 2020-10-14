import { WorldService } from "../../game/world.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_def, op_client, op_gameconfig } from "pixelpai_proto";
import { ShopPanel } from "./ShopPanel";
import { ILayerManager } from "../Layer.manager";
import { BasePanel } from "../Components/BasePanel";
import { BaseMediator, UIType } from "apowophaserui";
import { MessageType } from "../../../structureinterface/message.type";

export class ShopMediator extends BaseMediator {
    public static NAME: string = "ShopMediator";
    private world: WorldService;
    private readonly _perPage = 50;
    private _curPage: number;
    private fetching: boolean;
    private isEnd = false;
    private mScene: Phaser.Scene;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.world = world;
        this.mScene = scene;
        this.mLayerManager = layerManager;
        this.mUIType = UIType.Normal;
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public getView(): BasePanel {
        return this.mView as BasePanel;
    }

    public show(param?: any) {
        if (this.mView && this.mView.isShow() || this.mShow) {
            return;
        }
        this.mView = new ShopPanel(this.mScene, this.world);
        this.mView.show(param);
        this.world.emitter.on(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
        this.world.emitter.on(MessageType.SYNC_USER_BALANCE, this.onSyncUserBalanceHandler, this);
        this.requestVirtualWorldQueryPackage(param[0].id, 1, ShopPanel.ShopSlotCount);
        this.mLayerManager.addToUILayer(this.mView);
        this.world.uiManager.checkUIState(ShopMediator.NAME, false);
        super.show(param);
    }

    public update(param?: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        if (!this.mView) return;
        this.mShow = false;
        this.world.emitter.off(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
        this.world.emitter.off(MessageType.SYNC_USER_BALANCE, this.onSyncUserBalanceHandler, this);
        this.mView.hide();
        this.mView = null;
        this.world.uiManager.checkUIState(ShopMediator.NAME, true);
        super.hide();
    }

    public destroy() {
        this.world.emitter.off(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
        this.world.emitter.off(MessageType.SYNC_USER_BALANCE, this.onSyncUserBalanceHandler, this);
        this.world = null;
        this.mScene = null;
        this._curPage = 0;
        this.fetching = false;
        this.isEnd = false;
        super.destroy();
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }

    private requestVirtualWorldQueryPackage(bagId: number, page?: number, perPage?: number) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
        content.id = bagId;
        content.page = page;
        content.perPage = perPage;
        this.world.connection.send(pkt);
    }

    private queryShopProps(page: number = 1, perPage: number = 50) {
        if (!!this.mParam === false) return;
        this.fetching = true;

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
        content.id = this.mParam[0].id;
        content.page = page;
        content.perPage = perPage;
        this.world.connection.send(pkt);
    }

    private queryPackageHandler(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
        if (data.items.length > 0 && data.id === this.mParam[0].id) {
            (this.mView as ShopPanel).setDataList(data);
            //  this.mView.addItems(data.items);
        } else {
            this.isEnd = true;
        }
        this.fetching = false;
    }

    private onShowItemHandler(item: op_gameconfig.IItem) {
        const prices = item.price;
        for (const price of prices) {
            if (price.coinType === op_def.CoinType.TU_DING_COIN) {
                // if (price.price > this.mView.price) {
                // todo alert
                // Globals.PromptManager.showAlert("图钉不足，是否前往充值？", this.onPayTuDingHandler, this, AlertmView.OK | AlertmView.CANCEL);
                // return;
                // }
            }
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = this.mParam[0].id;
        content.componentId = item.id;
        this.world.connection.send(pkt);
        // Globals.SocketManager.send(pkt);
    }

    private syncUserBalance() {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_USER_BALANCE);
        this.world.connection.send(pkt);
        // Globals.SocketManager.send(pkt);
    }

    private onChangeIndex(rate) {
        if (rate >= 0.9 && this.fetching === false && this.isEnd === false) {
            this._curPage++;
            this.queryShopProps(this._curPage);
        }
    }

    private onSyncUserBalanceHandler(balance: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_USER_BALANCE) {
        if (!!this.mView === false) { return; }
        // this.mView.setUserBalance(balance);
    }

    private onPayTuDingHandler() {
        // shell.openExternal("https://www.tooqing.com/recharge");
    }
}
