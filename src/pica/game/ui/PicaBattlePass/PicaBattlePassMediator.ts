import { PicaBattlePass } from "./PicaBattlePass";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, MessageType, ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";
import { IBattlePass, ICurrencyLevel, IMarketCommodity } from "picaStructure";

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
    this.game.emitter.on(this.key + "_takerewards", this.takeBattlePassReward, this);
    this.game.emitter.on(this.key + "_buyDeluxe", this.buyDeluxeBattlePassDeBug, this);
    this.game.emitter.on(this.key + "_buylevel", this.buyForceLevelUp, this);
    this.game.emitter.on(this.key + "_takemaxrewards", this.getMaxLevelReward, this);
  }

  hide() {
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(this.key + "_takerewards", this.takeBattlePassReward, this);
    this.game.emitter.on(this.key + "_buyDeluxe", this.buyDeluxeBattlePassDeBug, this);
    this.game.emitter.on(this.key + "_buylevel", this.buyForceLevelUp, this);
    this.game.emitter.on(this.key + "_takemaxrewards", this.getMaxLevelReward, this);
    super.hide();
  }

  panelInit() {
    super.panelInit();
    this.postBattlePassSituation();
  }

  destroy() {
    if (this.mModel) this.mModel.destroy();
    this.mModel = null;
    super.destroy();
  }

  onDisable() {
    this.proto.off("BATTLE_PASS_SITUATION ", this.onBATTLE_PASS_SITUATION, this);
  }

  onEnable() {
    this.proto.on("BATTLE_PASS_SITUATION ", this.onBATTLE_PASS_SITUATION, this);
  }
  private postBattlePassSituation() {
    this.game.sendCustomProto("", "battlePassFacade:postBattlePassSituation", {});
  }
  private takeBattlePassReward(level: number) {
    this.game.sendCustomProto("INT", "battlePassFacade:takeBattlePassReward", { count: level });
  }
  private buyDeluxeBattlePassDeBug(price: number) {
    this.game.sendCustomProto("INT", "battlePassFacade:takeBattlePassReward", { count: price });
  }
  private buyForceLevelUp() {
    this.game.sendCustomProto("", "battlePassFacade:forceLevelUp", {});
  }
  private getMaxLevelReward() {
    this.game.sendCustomProto("", "battlePassFacadegetMaxLevelReward", {});
  }

  private onBATTLE_PASS_SITUATION(packet: any) {
    const content: IBattlePass = packet.content;
  }

  private onCloseHandler() {
    this.hide();
  }
  private get config() {
    return <BaseDataConfigManager>this.game.configManager;
  }
}
