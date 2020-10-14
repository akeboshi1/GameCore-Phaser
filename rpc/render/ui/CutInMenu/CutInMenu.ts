import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { ConnectionService } from "../../../../lib/net/connection.service";

export class CutInMenu extends PacketHandler {
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
            //  this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE, this.onMineSettlePackageHandler);
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

    reqRightButton(uiid: number, btnid: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = packet.content;
        content.uiId = uiid;
        content.componentId = btnid;
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }

}
