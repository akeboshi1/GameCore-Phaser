import { MediatorBase } from "../../base/module/core/MediatorBase";
import { MessageBoxView } from "./view/MessageBoxView";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import Globals from "../../Globals";

export class MessageBoxMediator extends MediatorBase {
  get view(): MessageBoxView {
    return <MessageBoxView>this.viewComponent;
  }

  public onRegister() {
    this.initView();
    super.onRegister();
    const buttons = this.view.buttons;
    for (const button of buttons) {
      button.on("up", this.onTargetUIHandler, this);
    }
  }

  public onRemove() {
    super.onRemove();
    const buttons = this.view.buttons;
    for (const button of buttons) {
      button.cancel("up", this.onTargetUIHandler, this);
    }
  }

  private initView(): void {
    let param: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.param[0];
    this.view.setContext(param);
  }

  private onTargetUIHandler(target) {
    const node = target.node;
    if (!node || !this.m_Param) return;
    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    let content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    content.uiId = this.m_Param[0].id;
    content.componentId = node.id;

    Globals.SocketManager.send(pkt);
  }
}