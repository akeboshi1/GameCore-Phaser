import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";

export class PicBusinessStreet extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE, this.onMyStoreList);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET, this.onCOMMERCIAL_STREET);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS, this.onINDUSTRY_MODELS);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST, this.onSTORE_RANKING_LIST);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL, this.onSTORE_RANKING_DETAIL);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD, this.onSTORE_RANKING_REWARD);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY, this.onSTORE_ENTER_HISTORY);
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

    public query_My_STORE() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MY_STORE);
        this.connection.send(packet);
    }
    public query_TAKE_ALL_STORE_SAVINGS() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_ALL_STORE_SAVINGS);
        this.connection.send(packet);
    }

    public query_COMMERCIAL_STREET(sortedBy: string, storeType: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_COMMERCIAL_STREET);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_COMMERCIAL_STREET = packet.content;
        content.sortedBy = sortedBy;
        content.storeType = storeType;
        this.connection.send(packet);
    }

    public query_INDUSTRY_MODELS() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_INDUSTRY_MODELS);
        this.connection.send(packet);
    }
    public query_CREATE_STORE(modelId: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_STORE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_STORE = packet.content;
        content.modelId = modelId;
        this.connection.send(packet);
    }

    public query_ENTER_ROOM(roomId: string, password: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM = packet.content;
        content.roomId = roomId;
        content.password = password;
        this.connection.send(packet);
    }

    public query_RANKING_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_STORE_RANKING_LIST);
        this.connection.send(packet);
    }

    public query_STORE_RANKING_DETAIL(key: string, type: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_STORE_RANKING_DETAIL);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_STORE_RANKING_DETAIL = packet.content;
        content.key = key;
        content.type = type;
        this.connection.send(packet);
    }

    public query_STORE_RANKING_REWARD(key: string, type: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_STORE_RANKING_REWARD);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_STORE_RANKING_REWARD = packet.content;
        content.key = key;
        content.type = type;
        this.connection.send(packet);
    }

    public query_STORE_ENTER_HISTORY() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_STORE_ENTER_HISTORY);
        this.connection.send(packet);
    }
    private onMyStoreList(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE = packet.content;
        this.mEvent.emit("onmystore", content);
    }

    private onCOMMERCIAL_STREET(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET = packet.content;
        this.mEvent.emit("onstreet", content);
    }

    private onINDUSTRY_MODELS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS = packet.content;
        this.mEvent.emit("onmodels", content);
    }

    private onSTORE_RANKING_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST = packet.content;
        this.mEvent.emit("onranklist", content);
    }
    private onSTORE_RANKING_DETAIL(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL = packet.content;
        this.mEvent.emit("onrankdetail", content);
    }
    private onSTORE_RANKING_REWARD(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD = packet.content;
        this.mEvent.emit("onrankreward", content);
    }

    private onSTORE_ENTER_HISTORY(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY = packet.content;
        this.mEvent.emit("onenterhistory", content);
    }

}
