import { PicaRewardTip } from "./PicaRewardTip";
import { op_client } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";

export class PicaRewardTipMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAREWARDTIP_NAME, game);
        this.mModel = new PicaRewardTip(this.game);
        this.game.emitter.on("showAward", this.onShowAwardHandler, this);
    }

    panelInit() {
        super.panelInit();

        this.mView.appendAward(this.mShowData);
    }

    public destroy() {
        this.game.emitter.off("showAward", this.onShowAwardHandler, this);
        super.destroy();
    }

    private onShowAwardHandler(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS) {
        this.show(content);
    }

}
