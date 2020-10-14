import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { ConnectionService } from "../../../../lib/net/connection.service";

export class Notice extends PacketHandler {
    private world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor(world: WorldService) {
        super();
        this.world = world;
        this.mEvent = new Phaser.Events.EventEmitter();
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_NOTICE, this.noticeHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }

    private noticeHandler(packet: PBpacket) {
        if (!packet || !packet.content) {
            return;
        }
        this.mEvent.emit("showNotice", packet);
    }
}
