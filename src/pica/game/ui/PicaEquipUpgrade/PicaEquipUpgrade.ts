import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";

export class PicaEquipUpgrade extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_ACTIVE_EQUIPMENT, this.onActiveEquipmend);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL, this.openEquipUpgrade);
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
        this.event.destroy();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
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
        this.event.emit("activeEquip", content.mineEquipment);
    }
    private openEquipUpgrade(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL = packge.content;
        this.event.emit("showopen", content);
    }

}
