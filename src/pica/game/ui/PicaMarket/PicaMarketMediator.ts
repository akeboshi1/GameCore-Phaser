import { PicaMarket } from "./PicaMarket";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, MessageType, ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";

export class PicaMarketMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.PICAMARKET_NAME, game);
    if (!this.mModel) {
      this.mModel = new PicaMarket(game);
    }
  }

  show(param?: any) {
    if (param) {
      this.model.setMarketName(param.marketName);
    } else {
      this.model.setMarketName("shop");
    }
    if (this.isShow()) return;
    super.show(param);
    this.game.emitter.on(this.key + "_getMarketCategories", this.onCategoriesHandler, this);
    this.game.emitter.on(this.key + "_queryMarket", this.onQueryResuleHandler, this);
    this.game.emitter.on(this.key + "_queryCommodityResource", this.onQueryCommodityResourceHandler, this);
    this.game.emitter.on(this.key + "_showopen", this.onShowOpenPanel, this);

    this.game.emitter.on(this.key + "_getCategories", this.onGetCategoriesHandler, this);
    this.game.emitter.on(this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.on(this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.on(this.key + "_queryPropResource", this.onQueryPropresouceHandler, this);
    this.game.emitter.on(this.key + "_setmarketdata", this.setMarketData, this);
    this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
  }

  hide() {
    this.game.emitter.off(this.key + "_getMarketCategories", this.onCategoriesHandler, this);
    this.game.emitter.off(this.key + "_queryMarket", this.onQueryResuleHandler, this);
    this.game.emitter.off(this.key + "_queryCommodityResource", this.onQueryCommodityResourceHandler, this);
    this.game.emitter.off(this.key + "_showopen", this.onShowOpenPanel, this);

    this.game.emitter.off(this.key + "_queryPropResource", this.onQueryPropresouceHandler, this);
    this.game.emitter.off(this.key + "_getCategories", this.onGetCategoriesHandler, this);
    this.game.emitter.off(this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.off(this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.off(this.key + "_setmarketdata", this.setMarketData, this);
    this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    super.hide();
  }

  panelInit() {
    super.panelInit();
    if (this.mShowData && this.mView) {
      // this.mView.setCategories(this.mShowData);
      this.onGetCategoriesHandler();
      this.onUpdatePlayerInfoHandler();
    }
  }

  destroy() {
    if (this.model) this.model.destroy();
    this.mModel = null;
    super.destroy();
  }

  protected mediatorExport() {
  }
  private onUpdatePlayerInfoHandler() {
    const userData = this.game.user.userData;
    this.mView.setMoneyData(userData.money, userData.diamond, userData.level);
  }
  private onCategoriesHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES) {
    if (this.mView) {
      this.mView.setCategories(content);
    }
  }

  private onQueryResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
    if (this.mView)
      this.mView.setProp(content);
  }

  private onGetCategoriesHandler() {
    // this.model.getMarkCategories();
    const config = <BaseDataConfigManager>this.game.configManager;
    const shopName = this.model.market_name;
    if (shopName === "shop") {
      const names = ["shop", "crownshop", "gradeshop"];
      config.checkDynamicShop(names).then(() => {
        const map = new Map();
        for (const name of names) {
          const temp = config.getShopSubCategory(name);
          temp.forEach((value, key) => {
            key.shopName = name;
            map.set(key, value);
          });
        }
        this.setCategories(map);
      }, () => {
        Logger.getInstance().error("配置文件" + shopName + "未能成功加载");
      });
    } else {
      this.model.queryShopData();
    }
  }

  private setMarketData(content: any) {
    this.model.market_data = this.convertMarketData(content);
    const config = <BaseDataConfigManager>this.game.configManager;
    const categories = config.convertDynamicCategory(content);
    if (this.mView)
      this.mView.setCategories(categories);
    this.mShowData = categories;
  }

  private convertMarketData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SHOP_DATA) {
    const config = <BaseDataConfigManager>this.game.configManager;
    const result = [];
    content.items.forEach((data) => {
      config.convertShopItem(data, config.getConfig("shop"));
      if (data["name"] != null) {
        result.push(data);
      }
    });
    return result;
  }

  private onQueryPropHandler(data: { page: number, category: string, subCategory: string, shopName: string }) {
    // this.model.queryMarket(data.page, data.category, data.subCategory);
    this.setMarketProp(data.category, data.subCategory, data.shopName);
  }

  private onBuyItemHandler(prop: op_def.IOrderCommodities) {
    this.model.buyMarketCommodities([prop]);
  }

  private onQueryPropresouceHandler(prop: op_client.IMarketCommodity) {
    this.model.queryCommodityResource(prop.id, prop.category);
  }

  private onShowOpenPanel(content: any) {
    this.setParam([content]);
    this.show(content);
  }

  private onPopItemCardHandler(data: { prop, display }) {
    const packet = {
      content: {
        name: "ItemPopCard",
        prop: data.prop,
        display: data.display
      }
    };
    this.game.peer.workerEmitter(MessageType.SHOW_UI, packet);
  }

  private onQueryCommodityResourceHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (!this.mView) {
      return;
    }
    this.mView.setCommodityResource(content);
  }

  private setCategories(map: Map<any, any>) {
    const arrValue = [];
    const obj = { marketCategory: arrValue };
    map.forEach((value, key) => {
      arrValue.push({ category: key, subcategory: value });
    });
    if (this.mView)
      this.mView.setCategories(obj);
    this.mShowData = obj;
  }

  private setMarketProp(category: string, subCategory: string, shopName?: string) {
    let att;
    shopName = shopName || this.model.market_name;
    if (shopName === "shop" || shopName === "crownshop" || shopName === "gradeshop") {
      const config = <BaseDataConfigManager>this.game.configManager;
      att = config.getShopItems(category, subCategory, shopName);
    } else {
      att = this.model.market_data;
    }

    const obj = { category, subCategory, commodities: att, marketName: shopName };
    if (this.mView)
      this.mView.setProp(obj);
  }

  private onCloseHandler() {
    this.hide();
  }

  private get model(): PicaMarket {
    return (<PicaMarket>this.mModel);
  }
}
