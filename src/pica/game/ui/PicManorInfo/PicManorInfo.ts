import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_gameconfig, op_pkt_def, op_def } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";

export class PicManorInfo extends BasicModel {
    private market_name = "manor_shop";
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES, this.onGetMarketCategoriesHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY, this.onQueryMarketHandler);
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

    public query_BUY_EDITOR_MANOR(roomid: string, index: number, op: number, manorName) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MODIFY_MANOR);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MODIFY_MANOR = packet.content;
        content.roomId = roomid;
        content.index = index;
        content.op = op;
        content.manorName = manorName;
        this.connection.send(packet);
    }

    /**
     * 获取商品分类
     */
    getMarkCategories(index: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_GET_CATEGORIES);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_GET_CATEGORIES = packet.content;
        content.marketName = this.market_name;
        content.param = index;
        this.connection.send(packet);
    }

    queryMarket(page: number, category: string, subCategory: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY = packet.content;
        content.page = page;
        content.perPage = 1000;
        content.category = category;
        content.subcategory = subCategory;
        content.marketName = this.market_name;
        this.connection.send(packet);
    }

    buyMarketCommodities(commodities: op_def.IOrderCommodities[]) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES = packet.content;
        content.orderCommodities = commodities;
        content.marketName = this.market_name;
        this.connection.send(packet);
    }

    use_MANOR_SHOP_USE_COMMODITY(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_USE_MANOR_SHOP_USE_COMMODITY);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_USE_MANOR_SHOP_USE_COMMODITY = packet.content;
        content.commodityId = id;
        content.marketName = this.market_name;
        this.connection.send(packet);
    }

    private onGetMarketCategoriesHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES = packet.content;
        if (content.marketName === this.market_name) {
            this.game.emitter.emit("getMarketCategories", content);
        }
    }

    private onQueryMarketHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY = packet.content;
        if (content.marketName === this.market_name) {
            this.game.emitter.emit("queryMarket", content);
        }
    }
}

export interface IManorBillboardData {
    uiName?: string;
    manorIndex?: number;
    ownerName?: string;
    streetName?: string;
    alreadyBuy?: boolean;
    ownerId?: string;
    price?: op_gameconfig.IPrice;
    myowner?: boolean;
    requireLevel?: number;
    manorName?: string;
}
