import { MediatorBase } from "../../base/module/core/MediatorBase";
import { NoticeView } from "./NoticeView";
import Globals from "../../Globals";
import { MessageType } from "../../common/const/MessageType";
import { op_client } from "pixelpai_proto";

export class NoticeMediator extends MediatorBase {
  public get view(): NoticeView {
    return <NoticeView>this.viewComponent;
  }

  public onRegister() {
    super.onRegister();

    Globals.MessageCenter.on(MessageType.SHOW_NOTICE, this.showNoticeHandler, this);
  }

  public onRemove() {
    Globals.MessageCenter.cancel(MessageType.SHOW_NOTICE, this.showNoticeHandler, this);
    super.onRemove();
  }

  private showNoticeHandler(packet: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_NOTICE) {
    this.view.showNotice(packet.noticeContext, packet.chatsetting);
  }
}