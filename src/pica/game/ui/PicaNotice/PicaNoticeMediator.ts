import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { Logger } from "utils";

export class PicaNoticeMediator extends BasicMediator {
  private mPanelQueue: any[] = [];
  private mCreatingPanel: boolean = false;
  constructor(game: Game) {
    super(ModuleName.PICANOTICE_NAME, game);
  }

  show(param?: any) {
    super.show(param);
    if (!param) {
      Logger.getInstance().error("NoticeMediator.show with no data");
      return;
    }
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    if (this.mView || this.mCreatingPanel) {
      this.mPanelQueue.push(param);
      return;
    }
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
    this.hide();
    if (this.mPanelQueue.length > 0) {
      const param = this.mPanelQueue.shift();
      this.show(param);
    }
  }
}
