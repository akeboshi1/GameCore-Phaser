import { BasicMediator, DataMgrType, ElementDataManager, Game } from "gamecore";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { IManorBillboardData, PicaRoomDecorate } from "./PicaRoomDecorate";

export class PicaRoomDecorateMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAROOMDECORATE_NAME, game);
        this.mModel = new PicaRoomDecorate(this.game);
        this.game.emitter.on("getMarketCategories", this.onCategoriesHandler, this);
        this.game.emitter.on("queryMarket", this.onQueryResuleHandler, this);
    }

    show(param?: any) {
        const data = this.disposalManorInfo(param);
        this.addActionLisenter(param[1]);
        param = data;

        super.show(param);
        this.game.emitter.on(this.key + "_hide", this.onHidePanel, this);
        this.game.emitter.on(this.key + "_buyeditor", this.query_BUY_EDITOR_MANOR, this);
        this.game.emitter.on(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.on(this.key + "_queryProp", this.onQueryPropHandler, this);
        this.game.emitter.on(this.key + "_buyItem", this.onBuyItemHandler, this);
        this.game.emitter.on(this.key + "_usingitem", this.onUsingItemHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_buyeditor", this.query_BUY_EDITOR_MANOR, this);
        this.game.emitter.off(this.key + "_hide", this.onHidePanel, this);
        this.game.emitter.off(this.key + "_getCategories", this.onGetCategoriesHandler, this);
        this.game.emitter.off(this.key + "_queryProp", this.onQueryPropHandler, this);
        this.game.emitter.off(this.key + "_buyItem", this.onBuyItemHandler, this);
        this.game.emitter.off(this.key + "_usingitem", this.onUsingItemHandler, this);
        super.hide();
    }

    destroy() {
        const elemgr = this.eleDataMgr;
        if (elemgr)
            elemgr.offAction(undefined, EventType.SCENE_ELEMENT_DATA_UPDATE, this.onUpdateData, this);
        this.game.emitter.off("getMarketCategories", this.onCategoriesHandler, this);
        this.game.emitter.off("queryMarket", this.onQueryResuleHandler, this);
        super.destroy();
    }

    private onHidePanel() {
        this.hide();
    }

    private query_BUY_EDITOR_MANOR(data: { roomid: string, index: number, type: number, manorName?: string }) {
        this.model.query_BUY_EDITOR_MANOR(data.roomid, data.index, data.type, data.manorName);
    }
    private disposalManorInfo(param: any) {
        if (param && param.length > 0) {
            const data: IManorBillboardData = param[0];
            data.myowner = this.game.user.userData.cid === data.ownerId;
            return data;
        }
        return undefined;
    }

    private onUpdateData(data) {
        data.myowner = this.game.user.userData.cid === data.ownerId;
        this.mView.setManorInfo(data);
    }
    get eleDataMgr() {
        if (this.game) {
            const dataMgr = this.game.getDataMgr<ElementDataManager>(DataMgrType.EleMgr);
            return dataMgr;
        }
        return undefined;
    }

    private addActionLisenter(id: number) {
        const elemgr = this.eleDataMgr;
        if (elemgr)
            elemgr.onAction(id, EventType.SCENE_ELEMENT_DATA_UPDATE, this.onUpdateData, this);
    }
    private onCategoriesHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES) {
        if (this.mView)
            this.mView.setShopCategories(content);
    }

    private onQueryResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
        if (this.mView)
            this.mView.setShopDatas(content);
    }
    private onGetCategoriesHandler(index: number) {
        this.model.getMarkCategories(index);
    }

    private onQueryPropHandler(data: { page: number, category: string, subCategory: string }) {
        this.model.queryMarket(data.page, data.category, data.subCategory);
    }

    private onBuyItemHandler(prop: op_def.IOrderCommodities) {
        this.model.buyMarketCommodities([prop]);
    }
    private onUsingItemHandler(id: string) {
        this.model.use_MANOR_SHOP_USE_COMMODITY(id);
    }
    private get model(): PicaRoomDecorate {
        return (<PicaRoomDecorate>this.mModel);
    }
}
