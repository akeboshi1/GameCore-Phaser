import { PicaBattlePass } from "./PicaBattlePass";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, MessageType, ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";
import { ICurrencyLevel, IMarketCommodity } from "picaStructure";

export class PicaBattlePassMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.PICABATTLEPASS_NAME, game);
    if (!this.mModel) {
      this.mModel = new PicaBattlePass(game);
    }
  }

  show(param?: any) {
    super.show(param);

    this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(this.key + "_popItemCard", this.onPopItemCardHandler, this);
  }

  hide() {
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(this.key + "_popItemCard", this.onPopItemCardHandler, this);
    super.hide();
  }

  panelInit() {
    super.panelInit();
  }

  destroy() {
    if (this.mModel) this.mModel.destroy();
    this.mModel = null;
    super.destroy();
  }

  onDisable() {
    this.proto.off("BOUGHT_REPUTATIONITEMS ", this.onBOUGHT_REPUTATIONITEMS, this);
  }

  onEnable() {
    this.proto.on("BOUGHT_REPUTATIONITEMS ", this.onBOUGHT_REPUTATIONITEMS, this);
  }
  private sendGetGiftPackBoughtStatus() {
    this.game.sendCustomProto("STRING_INT", "reputationFacade:postAllBoughtPopularityItems", {});
  }
  private onUpdatePlayerInfoHandler() {
    const userData = this.game.user.userData;
    const data: ICurrencyLevel = {
      money: userData.money, diamond: userData.diamond, level: userData.level, reputation: userData.reputation,
      reputationCoin: userData.popularityCoin, reputationLv: userData.reputationLevel
    };
    this.mView.setMoneyData(data);
  }

  private onBOUGHT_REPUTATIONITEMS(packet: any) {
    const status = packet.content.status;
    this.mView.updateBuyedProps(status);
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

  private onCloseHandler() {
    this.hide();
  }
}
