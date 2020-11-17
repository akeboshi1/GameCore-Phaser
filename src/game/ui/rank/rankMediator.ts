import { ModuleName, RENDER_PEER } from "structure";
import { BasicMediator, UIType } from "../basic/basic.mediator";
import { Game } from "../../game";

export class RankMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.RANK_NAME, game);
        this.mUIType = this.game.peer.isPlatform_PC() ? UIType.Scene : UIType.Normal;
    }

    public tweenView(show: boolean) {
        if (!this.mView || !this.game.peer.isPlatform_PC()) return;
        this.mView.tweenView(show);
    }

    hide(): void {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_hide", this.hide, this);
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
            if (!this.game.peer.isPlatform_PC()) {
                this.game.uiManager.checkUIState(ModuleName.RANK_NAME, true);
            }
        }
        super.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        if (this.mView) this.mView.resize();
    }

    show(param?: any): void {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.hide, this);
    }

    panelInit() {
        super.panelInit();
        if (this.mShowData && this.mShowData.length > 0) {
            this.mView.addItem(this.mShowData[0]);
        }
        if (!this.game.peer.isPlatform_PC()) {
            this.game.uiManager.checkUIState(ModuleName.RANK_NAME, false);
        }
    }

    update(param?: any): void {
        if (!this.mView) return;
        if (param && param.length > 0) {
            this.mView.update(param[0]);
        }
    }

}
