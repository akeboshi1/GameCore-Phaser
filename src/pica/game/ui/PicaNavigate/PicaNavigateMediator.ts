import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { PicaNavigate } from "./PicaNavigate";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName } from "structure";

export class PicaNavigateMediator extends BasicMediator {
  public static NAME: string = ModuleName.PICANAVIGATE_NAME;
  constructor(game: Game) {
    super(game);
    this.mModel = new PicaNavigate(this.game);
  }

  show(param?: any) {
    if (this.mPanelInit || this.mShow) {
      this.mView.show();
      return;
    }
    this.__exportProperty(() => {
      this.game.peer.render.showPanel(PicaNavigateMediator.NAME, param).then(() => {
        this.mView = this.game.peer.render[PicaNavigateMediator.NAME];
      });
      this.game.emitter.on(EventType.PANEL_INIT, this.onPanelInitCallBack, this);
      this.game.emitter.on("showPanel", this.onShowPanelHandler, this);
      this.game.emitter.on("close", this.onCloseHandler, this);
      this.game.emitter.on("goHome", this.onGomeHomeHandler, this);
    });
  }

  hide() {
    super.hide();
    this.game.emitter.off(EventType.PANEL_INIT, this.onPanelInitCallBack, this);
    this.game.emitter.off("showPanel", this.onShowPanelHandler, this);
    this.game.emitter.off("close", this.onCloseHandler, this);
    this.game.emitter.off("goHome", this.onGomeHomeHandler, this);
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
    uiManager.showExistMed(PicaChatMediator.name, "");
    this.destroy();
  }

  private onShowPanelHandler(data: { panel: string, data?: any }) {
    if (!data.panel || !this.game) {
      return;
    }
    const uiManager = this.game.uiManager;
    if (data.data)
      uiManager.showMed(data.panel, data.data);
    else uiManager.showMed(data.panel);
  }
  private onGomeHomeHandler() {
    (<PicaNavigate>this.mModel).queryGOHomeHandler();
  }
}
