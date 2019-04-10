import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client} from "pixelpai_proto";
import {BasePacketHandler} from "./BasePacketHandler";
import {MessageType} from "../const/MessageType";

export class ChatService extends BaseSingleton {
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
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
    }

    private handleCharacterChat(packet: PBpacket): void {
        let chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        Globals.MessageCenter.emit(MessageType.CHAT_TO, chat);
    }
}
