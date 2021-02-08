import { PicaMarket } from "./PicaMarket";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, MessageType, ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../data";
import { Logger } from "utils";

export class PicaMarketMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.PICAMARKET_NAME, game);
    if (!this.mModel) {
      this.mModel = new PicaMarket(game);
    }
  }

  show(param?: any) {
    super.show(param);

    if (param && param[0]) {
      this.model.setMarketName(param[0].marketName);
    } else {
      this.model.setMarketName("shop");
    }
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
  }

  hide() {
    this.game.emitter.off(this.key + "_getMarketCategories", this.onCategoriesHandler, this);
    this.game.emitter.off(this.key + "_queryMarket", this.onQueryResuleHandler, this);
    this.game.emitter.off(this.key + "_queryCommodityResource", this.onQueryCommodityResourceHandler, this);
    this.game.emitter.off(this.key + "_showopen", this.onShowOpenPanel, this);

    this.game.emitter.off(this.key + "_getCategories", this.onGetCategoriesHandler, this);
    this.game.emitter.off(this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.off(this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.off(this.key + "_queryPropResource", this.onQueryPropresouceHandler, this);
    super.hide();
  }

  panelInit() {
    super.panelInit();
    if (this.mShowData && this.mView) {
      this.mView.setCategories(this.mShowData);
    }
  }

  destroy() {
    if (this.model) this.model.destroy();
    this.mModel = null;
    super.destroy();
  }

  protected mediatorExport() {
  }

  private onCategoriesHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES) {
    if (this.mView)
      this.mView.setCategories(content);
  }

  private onQueryResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
    if (this.mView)
      this.mView.setProp(content);
  }

  private onGetCategoriesHandler() {
    this.model.getMarkCategories();
    const config = <BaseDataConfigManager>this.game.configManager;
    const shopName = this.model.market_name;
    config.checkDynamicShop(shopName).then(() => {
      const map = config.getShopSubCategory(shopName);
      this.setCategories(map);
    }, () => {
      Logger.getInstance().error("配置文件" + shopName + "未能成功加载");
    });
  }

  private onQueryPropHandler(data: { page: number, category: string, subCategory: string }) {
    // this.model.queryMarket(data.page, data.category, data.subCategory);
    this.setMarketProp(data.category, data.subCategory);
  }

  private onBuyItemHandler(prop: op_def.IOrderCommodities) {
    this.model.buyMarketCommodities([prop]);
  }

  private onQueryPropresouceHandler(prop: op_client.IMarketCommodity) {
    this.model.queryCommodityResource(prop.id, prop.category);
  }

  private onShowOpenPanel(content: any) {
    this.setParam([content]);
    this.show([content]);
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
    const obj = { marketName: this.model.market_name, marketCategory: arrValue };
    map.forEach((value, key) => {
      arrValue.push({ category: key, subcategory: value });
    });
    if (this.mView)
      this.mView.setCategories(obj);
    this.mShowData = obj;
  }

  private setMarketProp(category: string, subCategory: string) {
    const config = <BaseDataConfigManager>this.game.configManager;
    const att = config.getShopItems(category, subCategory, this.model.market_name);
    const obj = { category, subCategory, commodities: att, marketName: this.model.market_name };
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
