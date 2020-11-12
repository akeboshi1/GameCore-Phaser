import { BasicMediator, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName, RENDER_PEER } from "structure";
import { PicaBusinessStreet } from "./PicaBusinessStreet";

export class PicaBusinessStreetMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICABUSINESSSTREET_NAME, game);
        this.mModel = new PicaBusinessStreet(this.game);
        this.game.emitter.on("onmystore", this.onMyStoreList, this);
        this.game.emitter.on("onstreet", this.onCOMMERCIAL_STREET, this);
        this.game.emitter.on("onmodels", this.onINDUSTRY_MODELS, this);
        this.game.emitter.on("onranklist", this.onSTORE_RANKING_LIST, this);
        this.game.emitter.on("onrankdetail", this.onSTORE_RANKING_DETAIL, this);
        this.game.emitter.on("onrankreward", this.onSTORE_RANKING_REWARD, this);
        this.game.emitter.on("onenterhistory", this.onSTORE_ENTER_HISTORY, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querymystore", this.queryMyStoreList, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryallsaves", this.query_TAKE_ALL_STORE_SAVINGS, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querystreet", this.query_COMMERCIAL_STREET, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querymodels", this.query_INDUSTRY_MODELS, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querycreatestore", this.query_CREATE_STORE, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryenterroom", this.query_ENTER_ROOM, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryranklist", this.query_RANKING_LIST, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryrankdetail", this.query_STORE_RANKING_DETAIL, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryrankreward", this.query_STORE_RANKING_REWARD, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryenterhistory", this.query_STORE_ENTER_HISTORY, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.onHidePanel, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querymystore", this.queryMyStoreList, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryallsaves", this.query_TAKE_ALL_STORE_SAVINGS, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querystreet", this.query_COMMERCIAL_STREET, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querymodels", this.query_INDUSTRY_MODELS, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querycreatestore", this.query_CREATE_STORE, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryenterroom", this.query_ENTER_ROOM, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryranklist", this.query_RANKING_LIST, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryrankdetail", this.query_STORE_RANKING_DETAIL, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryrankreward", this.query_STORE_RANKING_REWARD, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryenterhistory", this.query_STORE_ENTER_HISTORY, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_hide", this.onHidePanel, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off("onmystore", this.onMyStoreList, this);
        this.game.emitter.off("onstreet", this.onCOMMERCIAL_STREET, this);
        this.game.emitter.off("onmodels", this.onINDUSTRY_MODELS, this);
        this.game.emitter.off("onranklist", this.onSTORE_RANKING_LIST, this);
        this.game.emitter.off("onrankdetail", this.onSTORE_RANKING_DETAIL, this);
        this.game.emitter.off("onrankreward", this.onSTORE_RANKING_REWARD, this);
        this.game.emitter.off("onenterhistory", this.onSTORE_ENTER_HISTORY, this);
        super.destroy();
    }

    private onHidePanel() {
        this.hide();
    }

    private queryMyStoreList() {
        this.model.query_My_STORE();
    }
    private query_TAKE_ALL_STORE_SAVINGS() {
        this.model.query_TAKE_ALL_STORE_SAVINGS();
    }

    private query_COMMERCIAL_STREET(data: { storeby: string, storetype: string }) {
        this.model.query_COMMERCIAL_STREET(data.storeby, data.storetype);
    }

    private query_INDUSTRY_MODELS() {
        this.model.query_INDUSTRY_MODELS();
    }
    private query_CREATE_STORE(modelId: string) {
        this.model.query_CREATE_STORE(modelId);
    }

    private query_ENTER_ROOM(data: { roomid: string, password: string }) {
        this.model.query_ENTER_ROOM(data.roomid, data.password);
    }

    private query_RANKING_LIST() {
        this.model.query_RANKING_LIST();
    }

    private query_STORE_RANKING_DETAIL(data: { key: string, type: string }) {
        this.model.query_STORE_RANKING_DETAIL(data.key, data.type);
    }

    private query_STORE_RANKING_REWARD(data: { key: string, type: string }) {
        this.model.query_STORE_RANKING_REWARD(data.key, data.type);
    }
    private query_STORE_ENTER_HISTORY() {
        this.model.query_STORE_ENTER_HISTORY();
    }
    private onMyStoreList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE) {
        this.mView.setMyStore(content);
    }
    private onCOMMERCIAL_STREET(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET) {
        this.mView.setCommercialStreet(content);
    }

    private onINDUSTRY_MODELS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS) {
        this.mView.setIndustryModels(content);
    }
    private onSTORE_RANKING_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST) {
        this.mView.setStoreRankingList(content);
    }
    private onSTORE_RANKING_DETAIL(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL) {
        this.mView.setStoreRankingDetial(content);
    }
    private onSTORE_RANKING_REWARD(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD) {
        this.mView.setStoreRankingReward(content);
    }
    private onSTORE_ENTER_HISTORY(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY) {
        this.mView.setEnterHistory(content);
    }
    private get model(): PicaBusinessStreet {
        return (<PicaBusinessStreet>this.mModel);
    }
}
