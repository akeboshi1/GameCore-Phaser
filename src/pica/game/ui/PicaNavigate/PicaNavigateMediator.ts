import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { PicaNavigate } from "./PicaNavigate";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";

export class PicaNavigateMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.PICANAVIGATE_NAME, game);
    this.mModel = new PicaNavigate(this.game);
  }

  show(param?: any) {
    super.show(param);
  }

  hide() {
    super.hide();
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_showPanel", this.onShowPanelHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_goHome", this.onGomeHomeHandler, this);
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

  protected panelInit() {
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_showPanel", this.onShowPanelHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_goHome", this.onGomeHomeHandler, this);
  }

  protected _show() {
    this.mView.show();
  }

  private onCloseHandler() {
    if (!this.game) {
      return;
    }
    const uiManager = this.game.uiManager;
    uiManager.showExistMed(PicaChatMediator.name, "");
    this.hide();
  }

  private onShowPanelHandler(panel: string) {
    if (!panel || !this.game) {
      return;
    }
    const uiManager = this.game.uiManager;
    uiManager.showMed(panel);
  }
  private onGomeHomeHandler() {
    (<PicaNavigate>this.mModel).queryGOHomeHandler();
  }
}
