import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { ModuleName } from "structure";
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
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_hide", this.onHideView, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_questbuy", this.sendBuyGiftPackDeBug, this);
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_hide", this.onHideView, this);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        super.destroy();
        this.mPlayerInfo = undefined;
    }

    private sendBuyGiftPackDeBug(obj: { id: string, count: number }) {
        this.game.sendCustomProto("STRING_INT", "giftPackFacade:buyGiftPackDeBug", obj);
    }

    private on_ORDER_LIST() {
        this.mView.setDataList();
    }
    private onHideView() {
        this.hide();
    }
    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
}
