import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicaRewardTip } from "./PicaRewardTip";
import { BaseDataConfigManager } from "picaWorker";

export class PicaRewardTipMediator extends BasicMediator {
    private mCacheData: any[] = [];
    constructor(game: Game) {
        super(ModuleName.PICAREWARDTIP_NAME, game);
        this.mModel = new PicaRewardTip(this.game);
        this.game.emitter.on("showAward", this.onShowAwardHandler, this);
    }

    show(param?: any) {
        super.show(param);
        if (param) {
            this.onUpdateItemBase(param);
            this.mCacheData = [param];
        }

    }

    panelInit() {
        super.panelInit();
        if (!this.mShowData) return;
        // if (this.mShowData.itemId) {
        //     this.onUpdateItemBase(this.mShowData);
        // }
        // this.mView.appendAward(this.mShowData);
        for (const oneData of this.mCacheData) {
            this.mView.appendAward(oneData);
        }
    }

    public destroy() {
        this.game.emitter.off("showAward", this.onShowAwardHandler, this);
        super.destroy();
    }

    private onShowAwardHandler(content: any) {
        if (content.itemId) {
            this.onUpdateItemBase(content);
        }
        if (!this.mPanelInit) {
            this.mCacheData.push(content);
            return;
        }
        this.mView.appendAward(content);
    }
    private onUpdateItemBase(content: any) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        const tempitem = configMgr.getItemBaseByID(content.itemId);
        if (tempitem) {
            content.display = tempitem["display"];
        }
    }
}
