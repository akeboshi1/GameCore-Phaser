import { BasicMediator, Game, UIType } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";
import { PicaOnline } from "./PicaOnline";
export class PicaOnlineMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAONLINE_NAME, game);
        this.mModel = new PicaOnline(this.game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_showPanel", this.onShowPanelHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_showPanel", this.onShowPanelHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        super.hide();
    }

    isSceneUI() {
        return false;
    }

    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
            this.mModel = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        if (!this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        const mediator = uiManager.getMed(ModuleName.PICACHAT_NAME);
        mediator.show();
        this.hide();
    }

    private onShowPanelHandler(panel: string) {
        if (!panel || !this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.showMed(panel);
    }
}
