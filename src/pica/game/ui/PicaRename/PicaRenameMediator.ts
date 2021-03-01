import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
import { PicaRename } from "./PicaRename";

export class PicaRenameMediator extends BasicMediator {
  protected mModel: PicaRename;
  constructor(game: Game) {
    super(ModuleName.PICARENAME_NAME, game);
    this.mModel = new PicaRename(this.game);
  }
  show(param?: any) {
    super.show(param);
    this.game.emitter.on(ModuleName.PICARENAME_NAME + "_hide", this.onHidePanel, this);
    this.game.emitter.on(ModuleName.PICARENAME_NAME + "_generatename", this.randomNameCallBack, this);
    this.game.emitter.on(ModuleName.PICARENAME_NAME + "_randomname", this.onRandomNameHandler, this);
    this.game.emitter.on(ModuleName.PICARENAME_NAME + "_submit", this.onSubmitHandler, this);

  }

  hide() {
    super.hide();
    this.game.emitter.off(ModuleName.PICARENAME_NAME + "_generatename", this.randomNameCallBack, this);
    this.game.emitter.off(ModuleName.PICARENAME_NAME + "_randomname", this.onRandomNameHandler, this);
    this.game.emitter.off(ModuleName.PICARENAME_NAME + "_hide", this.onHidePanel, this);
    this.game.emitter.off(ModuleName.PICARENAME_NAME + "_submit", this.onSubmitHandler, this);
  }

  protected panelInit() {
    super.panelInit();
    if (this.mView) {
      const obj = this.game.peer.getPlayerAvatar();
      if (obj) {
        this.mView.setSuitDatas(obj.suits);
      }
    }
  }
  private randomNameCallBack(val: string) {
    if (!this.mView)
      this.mView.setNickName(val);
  }

  private onRandomNameHandler() {
    this.mModel.onRandomNameHandler();
  }
  private onSubmitHandler(name: string, index: number, avatar?: any) {
    this.mModel.onSubmitHandler(name, index, avatar);
  }
  private onHidePanel() {
    this.hide();
  }
}
