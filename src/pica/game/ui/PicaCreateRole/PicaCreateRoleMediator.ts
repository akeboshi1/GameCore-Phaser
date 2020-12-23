import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_gameconfig } from "pixelpai_proto";
import { Logger } from "utils";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
import { PicaCreateRole } from "./PicaCreateRole";

export class PicaCreateRoleMediator extends BasicMediator {
  protected mModel: PicaCreateRole;
  constructor(game: Game) {
    super(ModuleName.PICACREATEROLE_NAME, game);
    this.game.emitter.on("GenerateName", this.randomNameCallBack, this);
    this.mModel = new PicaCreateRole(this.game);
  }

  show(param?: any) {
    super.show(param);
  }

  hide() {
    super.hide();

  }
  randomName() {
    this.mModel.onRandomNameHandler();
  }

  submit(name: string, index: number, avatar: op_gameconfig.IAvatar) {
    this.mModel.onSubmitHandler(name, index, avatar);
  }

  protected panelInit() {

  }

  private randomNameCallBack(val: string) {
    if (!this.mView) this.mView = this.game.peer.render[ModuleName.CREATEROLE_NAME];
    this.mView.setNickName(val);
  }
}
