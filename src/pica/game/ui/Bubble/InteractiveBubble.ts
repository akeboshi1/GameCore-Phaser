import { Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
export class InteractiveBubble extends PacketHandler {

    constructor(private game: Game) {
        super();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, this.onShowHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORDL_REQ_CLIENT_REMOVE_INTERACTIVE_BUBBLE, this.onClearHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    destroy() {
        this.unregister();
    }
    queryInteractiveHandler(data: any) {
        const connection = this.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE);
        const content: op_virtual_world.OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE = packet.content;
        content.id = data.id;
        //  content.receiverId = data.receiverId;
        connection.send(packet);
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    private onShowHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE = packet.content;
        this.game.emitter.emit("showbubble", content);
    }

    private onClearHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORDL_REQ_CLIENT_REMOVE_INTERACTIVE_BUBBLE = packet.content;
        this.game.emitter.emit("clearbubble", content.ids);
    }

}
