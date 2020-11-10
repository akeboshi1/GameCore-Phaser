import { Market } from "./Market";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, MessageType, ModuleName, RENDER_PEER } from "structure";

export class MarketMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.Market_NAME, game);
    if (!this.mModel) {
      this.mModel = new Market(game);
      this.game.emitter.on("getMarketCategories", this.onCategoriesHandler, this);
      this.game.emitter.on("queryMarket", this.onQueryResuleHandler, this);
      this.game.emitter.on("queryCommodityResource", this.onQueryCommodityResourceHandler, this);
      this.game.emitter.on("showopen", this.onShowOpenPanel, this);
    }
  }

  show(param?: any) {
    super.show(param);

    if (param && param[0]) {
      this.model.setMarketName(param[0].marketName);
    } else {
      this.model.setMarketName("shop");
    }
  }

  hide() {
    super.hide();
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_getCategories", this.onGetCategoriesHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryPropResource", this.onQueryPropresouceHandler, this);
  }

  destroy() {
    if (this.model) this.model.destroy();
    this.mModel = null;
    super.destroy();
  }

  protected mediatorExport() {
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_getCategories", this.onGetCategoriesHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryPropResource", this.onQueryPropresouceHandler, this);
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
  }

  private onQueryPropHandler(data: { page: number, category: string, subCategory: string }) {
    this.model.queryMarket(data.page, data.category, data.subCategory);
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

  private onCloseHandler() {
    super.destroy();
  }

  private get model(): Market {
    return (<Market>this.mModel);
  }
}
