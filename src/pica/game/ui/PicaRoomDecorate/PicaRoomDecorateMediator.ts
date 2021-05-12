import { BasicMediator, CacheDataManager, DataMgrType, ElementDataManager, Game } from "gamecore";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { RoomComponents, ExtraRoomInfo } from "custom_proto";
import { EventType, ModuleName } from "structure";
import { Logger } from "utils";
import { BaseDataConfigManager, DecorateShopConfig, ShopConfig } from "../../config";
import { Element2Config } from "../../config/element2.config";
import { PicaRoomDecorate } from "./PicaRoomDecorate";
import { IDecorateShop } from "picaStructure";

export class PicaRoomDecorateMediator extends BasicMediator {
    protected mModel: PicaRoomDecorate;
    protected content: RoomComponents;
    protected curCategory: string;
    protected categoryMaps: any;
    constructor(game: Game) {
        super(ModuleName.PICAROOMDECORATE_NAME, game);
        this.mModel = new PicaRoomDecorate(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
        this.game.emitter.on(this.key + "_getCategories", this.onCategoriesHandler, this);
        this.game.emitter.on(this.key + "_queryMarket", this.onQueryResuleHandler, this);
        this.game.emitter.on(this.key + "_buyItem", this.onBuyItemHandler, this);
        this.game.emitter.on(this.key + "_usingitem", this.onUsingItemHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_hide", this.hide, this);
        this.game.emitter.off(this.key + "_getCategories", this.onCategoriesHandler, this);
        this.game.emitter.off(this.key + "_queryMarket", this.onQueryResuleHandler, this);
        this.game.emitter.off(this.key + "_buyItem", this.onBuyItemHandler, this);
        this.game.emitter.off(this.key + "_usingitem", this.onUsingItemHandler, this);
        super.hide();
    }
    onEnable() {
        this.proto.on("RoomComponents", this.onRoomComponentsHandler, this);
        this.proto.on("ExtraRoomInfo", this.onExtraRoomInfoHandler, this);
    }

    onDisable() {
        this.proto.off("RoomComponents", this.onRoomComponentsHandler, this);
        this.proto.off("ExtraRoomInfo", this.onExtraRoomInfoHandler, this);
    }
    panelInit() {
        super.panelInit();
        this.queryRoomComponpents();
        if (this.categoryMaps) this.setCategories(this.categoryMaps);
        this.mView.setMoneyData(this.game.user.userData.money, this.game.user.userData.diamond);
    }
    private queryRoomComponpents() {
        const id = this.game.user.userData.curRoomID;
        this.game.sendCustomProto("STRING", "roomFacade:roomComponents", { id });
    }

    private onCategoriesHandler() {
        const config = this.config;
        const shopName = "roomComponentshop";
        const configs = [];
        if (!this.config.checkConfig(shopName)) {
            configs.push([shopName, new DecorateShopConfig()]);
        }
        if (configs.length > 0) {
            const maps = new Map(configs);
            config.dynamicLoad(<any>maps).then(() => {
                const map = config.getShopSubCategory(shopName);
                this.setCategories(map);
            }, (reponse) => {
                Logger.getInstance().error("未成功加载配置:" + reponse);
            });
        } else {
            const map = config.getShopSubCategory(shopName);
            this.setCategories(map);
        }

    }
    private setCategories(map: Map<any, any>) {
        let arrValue;
        map.forEach((value, key) => {
            arrValue = (value);
        });
        if (this.mView)
            this.mView.setShopCategories(arrValue);
        this.categoryMaps = map;
    }
    private onQueryResuleHandler(category: string) {
        this.curCategory = category;
        this.setShopDatas();
    }

    private setShopDatas() {
        if (this.content && this.curCategory && this.mView) {
            const items: IDecorateShop[] = <any>this.config.getDecorateShopItems(this.curCategory);
            const extras = this.game.cacheMgr.extraRoomInfo;
            const elementIdList = this.content.elementIdList;
            for (const temp of items) {
                if (temp.elementId === extras.wallId || temp.elementId === extras.floorId) {
                    temp.status = 2;
                } else if (elementIdList.indexOf(temp.elementId) !== -1) {
                    temp.status = 1;
                } else {
                    temp.status = 0;
                }
            }
            this.mView.setShopDatas(items);
        }
    }

    private onBuyItemHandler(prop: op_def.IOrderCommodities) {
        prop.quantity = 1;
        this.mModel.buyMarketCommodities([prop]);
    }
    private onUsingItemHandler(eleid: string) {
        const extras = this.game.cacheMgr.extraRoomInfo;
        if (eleid === extras.wallId || eleid === extras.floorId) return;
        this.game.sendCustomProto("STRING", "roomFacade:applyComponent", { id: eleid });
    }
    private onRoomComponentsHandler(proto: any) {
        this.content = proto.content;
        this.setShopDatas();
    }
    private onExtraRoomInfoHandler(packge: any) {
        const content: ExtraRoomInfo = packge.content;
        this.setShopDatas();
    }
    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
