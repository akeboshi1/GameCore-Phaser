import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";

export class PicaMainUI extends PacketHandler {
    private mEvent: Phaser.Events.EventEmitter;
    constructor(private world: WorldService) {
        super();
        this.mEvent = new Phaser.Events.EventEmitter();
        this.register();
    }

    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO, this.onUpdatePlayerInfo);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, this.onUpdateModeRoomInfo);
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

    private onUpdatePlayerInfo(packet: PBpacket) {
        this.mEvent.emit("updateplayer", packet.content);
    }

    private onUpdateModeRoomInfo(packet: PBpacket) {
        this.mEvent.emit("updateroom", packet.content);
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }
}
