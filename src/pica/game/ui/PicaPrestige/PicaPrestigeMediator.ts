import { PicaPrestige } from "./PicaPrestige";
import { BasicMediator, Game } from "gamecore";
import { EventType, MessageType, ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { ICurrencyLevel, IFameLevel } from "picaStructure";
import { Logger } from "utils";
import { FAME_STATUS } from "custom_proto";

export class PicaPrestigeMediator extends BasicMediator {
  protected mModel: PicaPrestige;
  constructor(game: Game) {
    super(ModuleName.PICAPRESTIGE_NAME, game);
    if (!this.mModel) {
      this.mModel = new PicaPrestige(game);
    }
  }

  show(param?: any) {
    super.show(param);
    this.game.emitter.on(this.key + "_showopen", this.onShowOpenPanel, this);
    this.game.emitter.on(this.key + "_getCategories", this.getMarketCategories, this);
    this.game.emitter.on(this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.on(this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.on(this.key + "_setmarketdata", this.setMarketData, this);
    this.game.emitter.on(this.key + "_setmarketdata", this.setMarketData, this);
    this.game.emitter.on(this.key + "_getlevelrewards", this.sendGetFameLevelReward, this);
    this.game.emitter.on(this.key + "_getallrewards", this.sendGetAllFameLevelReward, this);
    this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
  }

  hide() {
    this.game.emitter.off(this.key + "_showopen", this.onShowOpenPanel, this);

    this.game.emitter.off(this.key + "_getCategories", this.getMarketCategories, this);
    this.game.emitter.off(this.key + "_queryProp", this.onQueryPropHandler, this);
    this.game.emitter.off(this.key + "_buyItem", this.onBuyItemHandler, this);
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(this.key + "_popItemCard", this.onPopItemCardHandler, this);
    this.game.emitter.off(this.key + "_setmarketdata", this.setMarketData, this);
    this.game.emitter.off(this.key + "_getlevelrewards", this.sendGetFameLevelReward, this);
    this.game.emitter.off(this.key + "_getallrewards", this.sendGetAllFameLevelReward, this);
    this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);

    super.hide();
  }

  panelInit() {
    super.panelInit();
    this.sendPostFameStatus();
    this.onUpdatePlayerInfoHandler();
  }

  destroy() {
    if (this.mModel) this.mModel.destroy();
    this.mModel = null;
    super.destroy();
  }

  onDisable() {
    this.proto.off("BOUGHT_REPUTATIONITEMS", this.onBOUGHT_REPUTATIONITEMS, this);
    this.proto.off("FAME_STATUS", this.FAME_STATUS, this);
  }

  onEnable() {
    this.proto.on("BOUGHT_REPUTATIONITEMS", this.onBOUGHT_REPUTATIONITEMS, this);
    this.proto.on("FAME_STATUS", this.FAME_STATUS, this);
  }
  private sendGetGiftPackBoughtStatus() {
    this.game.sendCustomProto("STRING_INT", "reputationFacade:postAllBoughtPopularityItems", {});
  }
  private sendGetFameLevelReward(count: number) {
    this.game.sendCustomProto("INT", "reputationFacade:getFameLevelReward", { count });
  }
  private sendGetAllFameLevelReward() {
    this.game.sendCustomProto("STRING_INT", "reputationFacade:getAllFameLevelReward", {});
  }
  private sendPostFameStatus() {
    this.game.sendCustomProto("STRING_INT", "reputationFacade:postFameStatus", {});
  }

  private getMarketCategories() {
    this.onUpdatePlayerInfoHandler();
    this.onGetCategoriesHandler();
    this.sendGetGiftPackBoughtStatus();
  }
  private onUpdatePlayerInfoHandler() {
    const userData = this.game.user.userData;
    const data: ICurrencyLevel = {
      money: userData.money, diamond: userData.diamond, level: userData.level, reputation: userData.reputation,
      reputationCoin: userData.popularityCoin, reputationLv: userData.reputationLevel
    };
    this.mView.setMoneyData(data);
  }

  private onGetCategoriesHandler() {
    const config = <BaseDataConfigManager>this.game.configManager;
    const shopName = this.mModel.market_name;
    const names = ["gradeshop"];
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
  }

  private setMarketData(content: any) {
    this.mModel.market_data = this.convertMarketData(content);
    const config = <BaseDataConfigManager>this.game.configManager;
    const categories = config.convertDynamicCategory(content);
    if (this.mView)
      this.mView.setCategories(categories);
    this.mShowData = categories;
  }

  private convertMarketData(content: any) {
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
    // this.mModel.queryMarket(data.page, data.category, data.subCategory);
    this.setMarketProp(data.category, data.subCategory, data.shopName);
  }

  private onBuyItemHandler(prop: any) {
    this.mModel.buyMarketCommodities([prop], prop.marketName);
  }

  private onBOUGHT_REPUTATIONITEMS(packet: any) {
    const status = packet.content.status;
    this.mView.updateBuyedProps(status);
  }
  private FAME_STATUS(packet: any) {
    const content: FAME_STATUS = packet.content;
    const userData = this.game.user.userData;
    const pools = this.config.getFames();
    pools.forEach((value: IFameLevel) => {
      let allReceived = true;
      if (content.levelRewardTakenList.indexOf(value.level) === -1) {
        allReceived = false;
      }
      value.allReceived = allReceived;
      if (!allReceived) {
        if (value.level < userData.reputationLevel) {
          value.haveReward = true;
        } else if (value.level === userData.reputationLevel && value.exp === userData.reputation) {
          value.haveReward = true;
        }
      } else {
        value.haveReward = false;
      }

    });
    if (this.mView) {
      this.mView.setFameDatas(pools);
      this.mView.setFameStatus(content);
    }
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
    shopName = shopName || this.mModel.market_name;
    if (shopName === "shop" || shopName === "crownshop" || shopName === "gradeshop") {
      const config = <BaseDataConfigManager>this.game.configManager;
      att = config.getShopItems(category, subCategory, shopName);
    } else {
      att = this.mModel.market_data;
    }

    const obj = { category, subCategory, commodities: att, marketName: shopName };
    if (this.mView)
      this.mView.setProp(obj);
  }

  private onCloseHandler() {
    this.hide();
  }

  private get config() {
    return <BaseDataConfigManager>this.game.configManager;
  }
}
