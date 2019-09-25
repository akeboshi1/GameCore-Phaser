import {ChatPanel} from "./chat.panel";
import {WorldService} from "../../game/world.service";
import {PacketHandler, PBpacket} from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import {Logger} from "../../utils/log";

export class ChatMediator extends PacketHandler {
    private mChatPanel: ChatPanel;
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super();
        this.mChatPanel = new ChatPanel(scene, mWorld);
        if (this.mWorld.connection) {
            this.mWorld.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
        }

        this.mChatPanel.on("sendChat", this.onSendChatHandler, this);
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

    private onSendChatHandler(text: string) {
        if (this.mWorld.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
            const content: op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
            content.chatChannel = 0;
            content.chatContext = text;
            this.mWorld.connection.send(pkt);
        }
    }
}
