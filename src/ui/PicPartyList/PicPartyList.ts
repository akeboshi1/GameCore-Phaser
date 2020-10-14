import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";

export class PicPartyList extends PacketHandler {
    private readonly world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor(world: WorldService) {
        super();
        this.world = world;
        this.mEvent = new Phaser.Events.EventEmitter();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST, this.on_PARTY_LIST);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS, this.on_PLAYER_PROGRESS);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    destroy() {
        this.unregister();
        this.mEvent.destroy();
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }

    public query_PARTY_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PARTY_LIST);
        this.connection.send(packet);
    }
    public queryEnterRoom(roomID: string, password?: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM = packet.content;
        content.roomId = roomID;
        content.password = password;
        this.connection.send(packet);
    }
    // public query_PLAYER_PROGRESS() {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_PLAYER_PROGRESS);
    //     this.connection.send(packet);
    // }

    // public query_PLAYER_PROGRESS_REWARD(index: number) {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD);
    //     const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD = packet.content;
    //     content.index = index;
    //     this.connection.send(packet);
    // }
    private on_PARTY_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST = packet.content;
        this.mEvent.emit("questlist", content);
    }
    // private on_PLAYER_PROGRESS(packet: PBpacket) {
    //     const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS = packet.content;
    //     this.mEvent.emit("progresslist", content);
    // }
}
