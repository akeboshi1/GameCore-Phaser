import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { PicaRecharge } from "./PicaRecharge";
export class PicaRechargeMediator extends BasicMediator {
    protected mModel: PicaRecharge;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICARECHARGE_NAME, game);
        this.mModel = new PicaRecharge(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_questbuy", this.sendBuyGiftPackDeBug, this);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_questbuy", this.sendBuyGiftPackDeBug, this);
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    onDisable() {
        this.proto.off("BOUGHT_GIFTPACK_IDS", this.onBOUGHT_GIFTPACK_IDS, this);
    }

    onEnable() {
        this.proto.on("BOUGHT_GIFTPACK_IDS", this.onBOUGHT_GIFTPACK_IDS, this);
    }
    protected panelInit() {
        super.panelInit();
        this.sendGetGiftPackBoughtStatus();
        this.onUpdatePlayerInfoHandler();
    }
    private onUpdatePlayerInfoHandler() {
        const userData = this.game.user.userData;
        if (this.mView) this.mView.setMoneyData(userData.money, userData.diamond);
    }
    private sendBuyGiftPackDeBug(obj: { str: string, count: number }) {
        this.game.sendCustomProto("STRING_INT", "giftPackFacade:buyGiftPackDeBug", obj);
    }

    private sendGetGiftPackBoughtStatus() {
        this.game.sendCustomProto("STRING_INT", "giftPackFacade:getGiftPackBoughtStatus", {});
    }

    private onBOUGHT_GIFTPACK_IDS(packet: any) {
        const content = packet.content;
        const ids = content.status;
        if (!ids) return;
        const diamondData = this.config.getRecharges(1);
        const giftData = this.config.getRecharges(4);
        for (const temp of diamondData) {
            if (ids.indexOf(temp.id) === -1) {
                temp.double = true;
            }
        }
        for (const temp of giftData) {
            if (ids.indexOf(temp.id) === -1) {
                temp.double = true;
            }
        }
        this.mView.setDataList([diamondData, giftData]);
    }
    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    get config() {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
