import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";

export class PicaRewardTipMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAREWARDTIP_NAME, game);
        // this.mModel = new PicaRewardTip(this.game);
        // this.game.emitter.on("showAward", this.onShowAwardHandler, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAREWARDTIP_NAME + "_hide", this.hide, this);
    }

    panelInit() {
        super.panelInit();
        if (!this.mShowData) return;
        this.mView.appendAward(this.mShowData);
    }

    hide() {
        this.game.emitter.off(ModuleName.PICAREWARDTIP_NAME + "_hide", this.hide, this);
        super.hide();
    }

    public destroy() {
        // this.game.emitter.off("showAward", this.onShowAwardHandler, this);
        super.destroy();
    }

    // private onShowAwardHandler(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS) {
    //     this.show(content);
    // }

}
