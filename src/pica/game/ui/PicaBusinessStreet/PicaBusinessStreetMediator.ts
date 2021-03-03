import { BasicMediator, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../data";
import { PicaBusinessStreet } from "./PicaBusinessStreet";

export class PicaBusinessStreetMediator extends BasicMediator {
    private mCacheData_MyStore: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE = null;
    private mCacheData_Street: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET = null;
    private mCacheData_Models: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS = null;
    private mCacheData_RankindList: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST = null;
    private mCacheData_RankindDetail: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL = null;
    private mCacheData_RankindReward: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD = null;
    private mCacheData_History: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY = null;

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

    protected panelInit() {
        super.panelInit();
        if (this.mCacheData_MyStore) {
            this.onMyStoreList(this.mCacheData_MyStore);
            this.mCacheData_MyStore = null;
        }
        if (this.mCacheData_Street) {
            this.onCOMMERCIAL_STREET(this.mCacheData_Street);
            this.mCacheData_Street = null;
        }
        if (this.mCacheData_Models) {
            this.onINDUSTRY_MODELS(this.mCacheData_Models);
            this.mCacheData_Models = null;
        }
        if (this.mCacheData_RankindList) {
            this.onSTORE_RANKING_LIST(this.mCacheData_RankindList);
            this.mCacheData_RankindList = null;
        }
        if (this.mCacheData_RankindDetail) {
            this.onSTORE_RANKING_DETAIL(this.mCacheData_RankindDetail);
            this.mCacheData_RankindDetail = null;
        }
        if (this.mCacheData_RankindReward) {
            this.onSTORE_RANKING_REWARD(this.mCacheData_RankindReward);
            this.mCacheData_RankindReward = null;
        }
        if (this.mCacheData_History) {
            this.onSTORE_ENTER_HISTORY(this.mCacheData_History);
            this.mCacheData_History = null;
        }
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
        if (!this.mPanelInit) {
            this.mCacheData_MyStore = content;
            return;
        }
        this.mView.setMyStore(content);
    }
    private onCOMMERCIAL_STREET(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET) {
        if (!this.mPanelInit) {
            this.mCacheData_Street = content;
            return;
        }
        this.mView.setCommercialStreet(content);
    }

    private onINDUSTRY_MODELS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS) {
        if (content.industry) {
            const config = this.config;
            for (const industry of content.industry) {
                if (industry.buffDes) {
                    const texts = industry.buffDes.split(" ");
                    industry.buffDes = config.getI18n(texts[0]) + " " + (texts[1] ? texts[1] : "");
                }
                industry.des = config.getI18n(industry.des);
                industry.name = config.getI18n(industry.name);
                industry.state = config.getI18n(industry.state);
                for (const room of industry.roomModels) {
                    room.name = config.getI18n(room.name);
                }
            }
        }
        if (!this.mPanelInit) {
            this.mCacheData_Models = content;
            return;
        }
        this.mView.setIndustryModels(content);
    }
    private onSTORE_RANKING_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST) {
        if (content.rankChampions) {
            for (const data of content.rankChampions) {
                if (data.name) {
                    const arr = data.name.split(" ");
                    const text1 = this.config.getI18n(arr[0]);
                    const text2 = this.config.getI18n(arr[1]);
                    data.name = text1 + (text2 ? text2 : "");
                }
            }
        }
        if (!this.mPanelInit) {
            this.mCacheData_RankindList = content;
            return;
        }
        this.mView.setStoreRankingList(content);
    }
    private onSTORE_RANKING_DETAIL(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL) {
        if (!this.mPanelInit) {
            this.mCacheData_RankindDetail = content;
            return;
        }
        this.mView.setStoreRankingDetial(content);
    }
    private onSTORE_RANKING_REWARD(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD) {
        if (!this.mPanelInit) {
            this.mCacheData_RankindReward = content;
            return;
        }
        this.mView.setStoreRankingReward(content);
    }
    private onSTORE_ENTER_HISTORY(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY) {
        if (!this.mPanelInit) {
            this.mCacheData_History = content;
            return;
        }
        this.mView.setEnterHistory(content);
    }
    private get model(): PicaBusinessStreet {
        return (<PicaBusinessStreet>this.mModel);
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
