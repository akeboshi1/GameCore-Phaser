import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicaRewardTip } from "./PicaRewardTip";

export class PicaRewardTipMediator extends BasicMediator {
    private mCacheData: any[] = [];
    constructor(game: Game) {
        super(ModuleName.PICAREWARDTIP_NAME, game);
        this.mModel = new PicaRewardTip(this.game);
        this.game.emitter.on("showAward", this.onShowAwardHandler, this);
    }

    show(param?: any) {
        super.show(param);
    }

    panelInit() {
        super.panelInit();
        if (!this.mShowData) return;
        this.mView.appendAward(this.mShowData);
        for (const oneData of this.mCacheData) {
            this.mView.appendAward(oneData);
        }
        this.mCacheData = [];
    }

    public destroy() {
        this.game.emitter.off("showAward", this.onShowAwardHandler, this);
        super.destroy();
    }

    private onShowAwardHandler(content: any) {
        if (!this.mPanelInit) {
            this.mCacheData.push(content);
            return;
        }
        this.mView.appendAward(content);
    }
}
