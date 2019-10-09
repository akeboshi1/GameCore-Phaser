import { IMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { ShopModel } from "../../service/shop/shopModel";
import { MessageType } from "../../const/MessageType";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_def, op_client, op_gameconfig } from "pixelpai_proto";
import { ShopPanel } from "./ShopPanel";
import { ILayerManager } from "../layer.manager";

export class ShopMediator implements IMediator {
    public static NAME: string = "ShopMediator";
    public world: WorldService;
    private mView: ShopPanel;
    private mShopModel: ShopModel;
    private readonly _perPage = 50;
    private _curPage: number;
    private fetching: boolean;
    private isEnd = false;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        this.world = world;
        this.mShopModel = this.world.modelManager.getModel(ShopModel.NAME) as ShopModel;
        this.mView = new ShopPanel(scene, world);
        layerManager.addToUILayer(this.mView);
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any) {
        if (this.mView) this.mView.show();
        this.mShopModel.register();
        this.world.modelManager.on(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
        this.world.modelManager.on(MessageType.SYNC_USER_BALANCE, this.onSyncUserBalanceHandler, this);
    }

    public update(param?: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        if (this.mView) this.mView.hide();
        this.mShopModel.unRegister();
        this.world.modelManager.off(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
        this.world.modelManager.off(MessageType.SYNC_USER_BALANCE, this.onSyncUserBalanceHandler, this);
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }

    private queryShopProps(page: number = 1, perPage: number = 50) {
        // if (!!this.m_Param === false) return;
        this.fetching = true;

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
        // content.id = this.m_Param[0].id;
        content.page = page;
        content.perPage = perPage;
        this.world.connection.send(pkt);
    }

    private queryPackageHandler(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
        if (data.items.length > 0) {
            // this.mView.addItems(data.items);
        } else {
            this.isEnd = true;
        }
        this.fetching = false;
    }

    private onBuyItemHandler(item: op_gameconfig.IItem) {
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
        // content.uiId = this.m_Param[0].id;
        content.componentId = item.id;

        // Globals.SocketManager.send(pkt);
    }

    private syncUserBalance() {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_USER_BALANCE);
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
