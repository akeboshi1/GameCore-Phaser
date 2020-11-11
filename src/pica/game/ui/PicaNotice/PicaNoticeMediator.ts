import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { Logger } from "utils";

export class PicaNoticeMediator extends BasicMediator {
  private mPanelQueue: any[] = [];
  private mCreatingPanel: boolean = false;
  constructor(game: Game) {
    super(ModuleName.PICANOTICE_NAME, game);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
  }

  show(param?: any) {
    if (!param) {
      Logger.getInstance().error("NoticeMediator.show with no data");
      return;
    }
    if (this.mView || this.mCreatingPanel) {
      this.mPanelQueue.push(param);
      return;
    }
    super.show(param);
    this.mCreatingPanel = true;
  }

  panelInit() {
    super.panelInit();
    this.mCreatingPanel = false;
  }

  hide() {
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    super.hide();
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.hide();
      this.mView = undefined;
    }
    if (this.mPanelQueue.length > 0) {
      const param = this.mPanelQueue.shift();
      this.show(param);
    }
  }
}
