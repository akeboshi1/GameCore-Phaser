import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { IRecharge } from "src/pica/structure/irecharge";
import { EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { PicaPrestigeConvert } from "./PicaPrestigeConvert";
export class PicaPrestigeConvertMediator extends BasicMediator {
    protected mModel: PicaPrestigeConvert;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICAPRESTIGECONVERT_NAME, game);
        this.mModel = new PicaPrestigeConvert(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAPRESTIGECONVERT_NAME + "_convert", this.exchangeEnergyToReputationCoins, this);
        this.game.emitter.on(ModuleName.PICAPRESTIGECONVERT_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAPRESTIGECONVERT_NAME + "_convert", this.exchangeEnergyToReputationCoins, this);
        this.game.emitter.off(ModuleName.PICAPRESTIGECONVERT_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    onDisable() {
        this.proto.off("EXCHANGED_POPULARITY_COIN", this.onEXCHANGED_POPULARITY_COIN, this);
    }

    onEnable() {
        this.proto.on("EXCHANGED_POPULARITY_COIN", this.onEXCHANGED_POPULARITY_COIN, this);
    }
    protected panelInit() {
        super.panelInit();
        this.onUpdatePlayerInfoHandler();
        this.postExchangedPopularityCoin();
    }
    private onUpdatePlayerInfoHandler() {
        const userData = this.game.user.userData;
        const radio = this.config.getReputationCoin();
        const limit = this.config.getFrameLevel(userData.reputationLevel || 1);
        if (this.mView) this.mView.setExchangedEnergy(userData.energy, radio.count, limit.exchangeLimit);
    }
    private exchangeEnergyToReputationCoins(count: number) {
        this.game.sendCustomProto("INT", "reputationFacade:exchangeEnergyToReputationCoins", { count });
    }
    private postExchangedPopularityCoin() {
        this.game.sendCustomProto("INT", "reputationFacade:postExchangedPopularityCoin", {});
    }
    private onEXCHANGED_POPULARITY_COIN(packat) {
        const content = packat.content;
        this.mView.setExchangedPopularityCoin(content.exchangedValue);
    }
    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    get config() {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
