import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_gameconfig, op_pkt_def, op_def } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";

export class PicaRoomDecorate extends BasicModel {
    public market_name = "room";
    constructor(game: Game) {
        super(game);
        this.register();
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

    destroy() {
        this.unregister();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    buyMarketCommodities(commodities: op_def.IOrderCommodities[]) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES = packet.content;
        content.orderCommodities = commodities;
        content.marketName = this.market_name;
        this.connection.send(packet);
    }
}
