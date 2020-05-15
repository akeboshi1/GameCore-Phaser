import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";

export class EquipUpgrade extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_ACTIVE_EQUIPMENT, this.onActiveEquipmend);
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

    reqEquipedEquipment(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_MINING_MODE_EQUIP_EQUIPMENT);
        const content: op_virtual_world.OP_CLIENT_RES_VIRTUAL_WORLD_MINING_MODE_EQUIP_EQUIPMENT = packet.content;
        content.equipmentId = id;
        this.connection.send(packet);
    }

    reqActiveEquipment(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_MINING_MODE_ACTIVE_EQUIPMENT);
        const content: op_virtual_world.OP_CLIENT_RES_VIRTUAL_WORLD_MINING_MODE_ACTIVE_EQUIPMENT = packet.content;
        content.equipmentId = id;
        this.connection.send(packet);
    }

    private onActiveEquipmend(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_ACTIVE_EQUIPMENT = packge.content;
        this.mEvent.emit("activeEquip", content.mineEquipment);
    }

}