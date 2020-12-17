import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

export class PicaEffectMgr extends BasicModel {
    constructor( game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            //  this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UNLOCK_ELEMENT_REQUIREMENT, this.onRetOpenPanel);
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

    // queryUnlockElement(ids: number[]) {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UNLOCK_ELEMENT);
    //     const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UNLOCK_ELEMENT = packet.content;
    //     content.ids = ids;
    //     this.connection.send(packet);
    // }

    // private onRetOpenPanel(packet: PBpacket) {
    //     const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UNLOCK_ELEMENT_REQUIREMENT = packet.content;
    //     this.mEvent.emit("openview", content);
    // }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

}
