import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { MarketPanel } from "./MarketPanel";
import { ILayerManager } from "../layer.manager";
import { Market } from "./Market";
import { op_client, op_def } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { MessageType } from "../../const/MessageType";

export class MarketMediator extends BaseMediator {
  protected mView: MarketPanel;
  private readonly scene: Phaser.Scene;
  private readonly layerManager: ILayerManager;
  private mMarket: Market;
  constructor($layerManager: ILayerManager, $scene: Phaser.Scene, world: WorldService) {
    super(world);
    this.scene = $scene;
    this.layerManager = $layerManager;
  }

  show(param?: any) {
    if (this.mView && this.mView.isShow() || this.isShowing) {
      return;
    }
    this.mMarket = new Market(this.world);
    this.mMarket.register();
    this.mMarket.on("getMarketCategories", this.onCategoriesHandler, this);
    this.mMarket.on("queryMarket", this.onQueryResuleHandler, this);
    this.mMarket.on("queryCommodityResource", this.onQueryCommodityResourceHandler, this);
    this.mView = new MarketPanel(this.scene, this.world);
    this.mView.on("getCategories", this.onGetCategoriesHandler, this);
    this.mView.on("queryProp", this.onQueryPropHandler, this);
    this.mView.on("buyItem", this.onBuyItemHandler, this);
    this.mView.on("close", this.onCloseHandler, this);
    this.mView.on("popItemCard", this.onPopItemCardHandler, this);
    this.mView.on("queryPropResource", this.onQueryPropresouceHandler, this);
    this.mView.show();
    this.layerManager.addToUILayer(this.mView);
  }

  private onCategoriesHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES) {
    this.mView.setCategories(content);
  }

  private onQueryResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
    this.mView.setProp(content);
  }

  private onGetCategoriesHandler() {
    this.mMarket.getMarkCategories();
  }

  private onQueryPropHandler(page: number, category: string, subCategory: string) {
    this.mMarket.queryMarket(page, category, subCategory);
  }

  private onBuyItemHandler(prop: op_def.IOrderCommodities) {
    this.mMarket.buyMarketCommodities([prop]);
  }

  private onQueryPropresouceHandler(prop: op_client.IMarketCommodity) {
    this.mMarket.queryCommodityResource(prop.id, prop.category);
  }

  private onPopItemCardHandler(prop, display) {
    // const packet: PBpacket = new PBpacket(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI);
    // const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
    // content.name = "ItemPopCard";
    const packet = {
      content: {
        name: "ItemPopCard",
        prop,
        display
      }
    };
    this.world.emitter.emit(MessageType.SHOW_UI, packet);
  }

  private onQueryCommodityResourceHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (!this.mView) {
      return;
    }
    this.mView.setCommodityResource(content);
  }

  private onCloseHandler() {
    if (!this.mMarket) {
      return;
    }
    this.mMarket.destroy();
    this.mMarket = undefined;
    this.mView.hide();
    this.mView = undefined;
  }
}