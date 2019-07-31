import { MediatorBase } from "../../base/module/core/MediatorBase";
import { UserInfoView } from "./view/UserInfoView";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client } from "pixelpai_proto";
import Globals from "../../Globals";
import { MessageType } from "../../common/const/MessageType";
import { ModuleTypeEnum } from "../../base/module/base/ModuleType";

export class UserInfoMediator extends MediatorBase {

  onRegister() {
    this.initView();
    this.view.follwerBtn.on("up", this.showUIHandler, this);
    Globals.MessageCenter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onBackgroundClickHandler, this);
    super.onRegister();
  }

  onRemove() {
    this.view.follwerBtn.cancel("up", this.showUIHandler, this);
    Globals.MessageCenter.cancel(MessageType.SCENE_BACKGROUND_CLICK, this.onBackgroundClickHandler, this);
    super.onRemove();
  }

  onRecover() {
    this.initView();
  }

  private initView() {
    this.view.setData(this.param[0]);
  }

  public update(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI[]) {
    if (param && param.length > 0) {
      if (param[0].id === this.param[0].id) {
        this.view.updateItem(param[0]);
      }
    }
  }

  public onBreakOff() {
    super.onBreakOff();
    if (this.view) {
      this.view.onClear();
    }
  }

  private showUIHandler(item) {
    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    let content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    content.uiId = this.m_Param[0].id;
    content.componentId = item.node.id;

    Globals.SocketManager.send(pkt);
  }

  private onBackgroundClickHandler() {
    Globals.ModuleManager.closeModule(ModuleTypeEnum.UserInfo);
  }

  get view(): UserInfoView {
    return this.viewComponent;
  }
}