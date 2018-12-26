import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../../protocol/protocols";
import {MessageType} from "../const/MessageType";
import {BasePacketHandler} from "./BasePacketHandler";

export class ChatService extends BaseSingleton {
    public register(): void {
        Globals.SocketManager.addHandler(new Handler());
    }
}

class Handler extends BasePacketHandler {
    constructor() {
        super();
        // Server
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
    }

    private handleCharacterChat(packet: PBpacket): void {
        let chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        console.log(`${chat.chatContext}`);
    }

    //要一个发送聊天的方法

}