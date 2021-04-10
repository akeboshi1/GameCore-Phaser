import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
import { PicaCreateRole } from "./PicaCreateRole";

export class PicaCreateRoleMediator extends BasicMediator {
  protected mModel: PicaCreateRole;
  constructor(game: Game) {
    super(ModuleName.PICACREATEROLE_NAME, game);
    this.mModel = new PicaCreateRole(this.game);
  }
  show(param?: any) {
    if (param) this.mShowData = param;
    if (this.mPanelInit && this.mShow) {
      this._show();
      return;
    }
    this.mShow = true;
    this.__exportProperty(() => {
      this.game.peer.render.showCreateRolePanel(param).then(() => {
        this.mView = this.game.peer.render[this.key];
        this.panelInit();
      });
      this.mediatorExport();
    });
  }

  submit(gender: op_def.Gender, ids: string[]) {
    this.mModel.onSubmitHandler(gender, ids);
  }
  protected panelInit() {

  }
}
