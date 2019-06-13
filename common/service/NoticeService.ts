import BaseSingleton from "../../base/BaseSingleton";
import { BasePacketHandler } from "./BasePacketHandler";
import { op_client } from "pixelpai_proto";
import Globals from "../../Globals";
import { MessageType } from "../const/MessageType";
import { PBpacket } from "net-socket-packet";

export class NoticeService extends BaseSingleton {
  private handle: Handler;
  public register(): void {
    this.handle = new Handler();
    Globals.SocketManager.addHandler(this.handle);
  }

  public unRegister(): void {
      Globals.SocketManager.removeHandler(this.handle);
  }
}

class Handler extends BasePacketHandler {
  constructor() {
    super();
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_NOTICE, this.noticeHandler);
  }

  private noticeHandler(packet: PBpacket) {
    let notice: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_NOTICE = packet.content;
    Globals.MessageCenter.emit(MessageType.SHOW_NOTICE, notice);
  }
}