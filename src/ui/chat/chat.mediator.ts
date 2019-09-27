import { ChatPanel } from "./chat.panel";
import { WorldService } from "../../game/world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { IAbstractPanel } from "../abstractPanel";
import { IMediator } from "../baseMediator";

export class ChatMediator extends PacketHandler implements IMediator {
    public world: WorldService;
    private mChatPanel: ChatPanel;
    private mName: string;
    constructor(world: WorldService, scene: Phaser.Scene) {
        super();
        this.world = world;
        this.mChatPanel = new ChatPanel(scene, world);
        if (this.world.connection) {
            this.world.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
        }

        this.mChatPanel.on("sendChat", this.onSendChatHandler, this);
        this.world = world;
    }

    public isSceneUI(): boolean {
        return true;
    }

    public getName(): string {
        return this.mName;
    }

    public setName(val: string) {
        this.mName = val;
    }
    public getView(): IAbstractPanel {
        return this.mChatPanel;
    }

    public isShow(): boolean {
        return this.mChatPanel.isShow();
    }

    public resize() {
        if (this.mChatPanel) this.mChatPanel.resize();
    }

    public show(param: any) {
        this.mChatPanel.show();
    }

    public update(param?: any) {
        this.mChatPanel.update(param);
    }

    public hide() {
        this.mChatPanel.hide();
    }

    private handleCharacterChat(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        this.mChatPanel.appendChat(content.chatContext);
    }

    private onSendChatHandler(text: string) {
        if (this.world.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
            const content: op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
            content.chatChannel = 0;
            content.chatContext = text;
            this.world.connection.send(pkt);
        }
    }
}
