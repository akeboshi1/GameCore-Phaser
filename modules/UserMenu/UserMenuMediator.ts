import { MediatorBase } from "../../base/module/core/MediatorBase";
import { UserMenuView } from "./view/UserMenuView";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import Globals from "../../Globals";
import { MessageType } from "../../common/const/MessageType";
import { ModuleTypeEnum } from "../../base/module/base/ModuleType";

export class UserMenuMediator extends MediatorBase {
  onRegister() {
    super.onRegister();
    this.view.up.add(this.clickButtonHandler, this);
    Globals.MessageCenter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onBackgroundClickHandler, this);
  }

  onRemove() {
    super.onRemove();
    this.view.up.remove(this.clickButtonHandler, this);
    Globals.MessageCenter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onBackgroundClickHandler, this);
  }

  preRecover() {
    if (this.param && this.param.length > 0) {
      this.view.addItem(this.param[0]);
    }
  }

  update() {
    if (this.param && this.param.length > 0) {
      this.view.addItem(this.param[0]);
    }
  }

  private clickButtonHandler(item) {
    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    let content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    content.uiId = this.m_Param[0].id;
    content.componentId = item.id;

    Globals.SocketManager.send(pkt);
  }

  private onBackgroundClickHandler() {
    Globals.ModuleManager.closeModule(ModuleTypeEnum.UserMenu);
  }

  private get view(): UserMenuView {
    return this.viewComponent as UserMenuView;
  }
}