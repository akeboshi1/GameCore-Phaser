import { PicaPrestige } from "./PicaPrestige";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { IBattlePassState } from "picaStructure";

export class PicaPrestigeMediator extends BasicMediator {
  private mInitData: boolean = false;
  constructor(game: Game) {
    super(ModuleName.PICAPRESTIGE_NAME, game);
    if (!this.mModel) {
      this.mModel = new PicaPrestige(game);
    }
  }

  show(param?: any) {
    super.show(param);
    this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(this.key + "_takerewards", this.takeBattlePassReward, this);
    this.game.emitter.on(this.key + "_buyDeluxe", this.buyDeluxeBattlePassDeBug, this);
    this.game.emitter.on(this.key + "_buylevel", this.buyForceLevelUp, this);
    this.game.emitter.on(this.key + "_takemaxrewards", this.getMaxLevelReward, this);
    this.game.emitter.on(this.key + "_onekey", this.getOneKeyReward, this);
  }

  hide() {
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(this.key + "_takerewards", this.takeBattlePassReward, this);
    this.game.emitter.on(this.key + "_buyDeluxe", this.buyDeluxeBattlePassDeBug, this);
    this.game.emitter.on(this.key + "_buylevel", this.buyForceLevelUp, this);
    this.game.emitter.on(this.key + "_takemaxrewards", this.getMaxLevelReward, this);
    this.game.emitter.on(this.key + "_onekey", this.getOneKeyReward, this);
    super.hide();
    this.mInitData = false;
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
    this.proto.off("BATTLE_PASS_SITUATION", this.onBATTLE_PASS_SITUATION, this);
  }

  onEnable() {
    this.proto.on("BATTLE_PASS_SITUATION", this.onBATTLE_PASS_SITUATION, this);
  }
  private postBattlePassSituation() {
    this.game.sendCustomProto("INT", "battlePassFacade:postBattlePassSituation", {});
  }
  private takeBattlePassReward(level: number) {
    this.game.sendCustomProto("INT", "battlePassFacade:takeBattlePassReward", { count: level });
  }
  private buyDeluxeBattlePassDeBug(price: number) {
    this.game.sendCustomProto("INT", "battlePassFacade:buyDeluxeBattlePassDeBug", { count: price });
  }
  private buyForceLevelUp() {
    this.game.sendCustomProto("INT", "battlePassFacade:forceLevelUp", {});
  }
  private getMaxLevelReward() {
    this.game.sendCustomProto("INT", "battlePassFacade:getMaxLevelReward", {});
  }
  private getOneKeyReward() {
    this.game.sendCustomProto("INT", "battlePassFacade:takeAllBattlePassRewards", {});
  }
  private onBATTLE_PASS_SITUATION(packet: any) {
    const content: IBattlePassState = packet.content;
    this.mView.setBattleState(content);
    if (!this.mInitData) {
      this.setBattlDatas(content.battlePassId);
      this.mInitData = true;
    }
  }
  private setBattlDatas(id: string) {
    const battleData = this.config.getBattlePass(id);
    const battleLevels = this.config.getBattleLevels();
    this.mView.setBattleData(battleData, battleLevels);
  }
  private onCloseHandler() {
    this.hide();
  }
  private get config() {
    return <BaseDataConfigManager>this.game.configManager;
  }
}
