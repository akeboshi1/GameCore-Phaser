import {ChatPanel} from "./chat.panel";
import {WorldService} from "../../game/world.service";
import {PacketHandler, PBpacket} from "net-socket-packet";
import { op_client } from "pixelpai_proto";

export class ChatMediator extends PacketHandler {
    private mChatPanel: ChatPanel;
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super();
        this.mChatPanel = new ChatPanel(scene, mWorld);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
    }

    public show() {
        this.mChatPanel.show();
    }

    public close() {
        this.mChatPanel.close();
    }

    private handleCharacterChat(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        this.mChatPanel.appendChat(content.chatContext);
    }
}
