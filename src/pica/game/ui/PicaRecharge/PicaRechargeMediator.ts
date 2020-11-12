import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { ModuleName } from "structure";
import { PicaRecharge } from "./PicaRecharge";
export class PicaRechargeMediator extends BasicMediator {
    private picaRecharge: PicaRecharge;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICARECHARGE_NAME, game);
        this.picaRecharge = new PicaRecharge(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_questwork", this.query_WORK_ON_JOB, this);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on("questlist", this.on_ORDER_LIST, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_questwork", this.query_WORK_ON_JOB, this);
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off("questlist", this.on_ORDER_LIST, this);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picaRecharge) {
            this.picaRecharge.destroy();
            this.picaRecharge = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
        this.mPlayerInfo = undefined;
    }
    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    private query_ORDER_LIST() {
        this.picaRecharge.query_JOB_LIST();
    }

    private query_WORK_ON_JOB(id: string) {
        this.picaRecharge.query_WORK_ON_JOB(id);
    }

    private on_ORDER_LIST() {
        this.mView.setDataList();
    }
    private onHideView() {
        this.hide();
    }
}
