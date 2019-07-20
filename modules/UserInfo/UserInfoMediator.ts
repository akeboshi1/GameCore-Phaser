import { MediatorBase } from "../../base/module/core/MediatorBase";
import { UserInfoView } from "./view/UserInfoView";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import Globals from "../../Globals";

export class UserInfoMediator extends MediatorBase {

  onRegister() {
    this.initView();
    this.view.follwerBtn.on("up", this.showUIHandler, this);
    super.onRegister();
  }

  onRemove() {
    this.view.follwerBtn.on("up", this.showUIHandler, this);
    super.onRemove();
  }

  private initView() {
    this.view.setData(this.param[0]);
  }

  private showUIHandler(item) {
    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    let content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    content.uiId = this.m_Param[0].id;
    content.componentId = item.id;

    Globals.SocketManager.send(pkt);
  }

  get view(): UserInfoView {
    return this.viewComponent;
  }
}