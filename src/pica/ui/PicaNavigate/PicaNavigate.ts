import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { ConnectionService } from "../../../../lib/net/connection.service";
export class PicaNavigate extends PacketHandler {
    private readonly world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor($world: WorldService) {
        super();
        this.world = $world;
        this.mEvent = new Phaser.Events.EventEmitter();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
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

    queryGOHomeHandler() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GO_HOME);
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }
}
