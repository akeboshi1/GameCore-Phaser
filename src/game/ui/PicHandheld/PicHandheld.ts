import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { Game } from "src/game/game";
import { ModuleName } from "structure";

export class PicHandheld extends PacketHandler {
    constructor(private game: Game) {
        super();
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD, this.onRetHandheldList);
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

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    queryChangeHandheld(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PICK_HANDHELD);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PICK_HANDHELD = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    queryClearHandheld() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DROP_HANDHELD);
        this.connection.send(packet);
    }

    queryHandheldList() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_HANDHELD);
        this.connection.send(packet);
    }

    private onRetHandheldList(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD = packet.content;
        const view = this.game.peer.render[ModuleName.PICHANDHELD_NAME];
        view.setEqipedDatas(content);
    }
}
