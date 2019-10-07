import { IBaseModel } from "../baseModel";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { WorldService } from "../../game/world.service";
import { EventEmitter } from "events";
import { MessageType } from "../../const/MessageType";
import { ConnectionService } from "../../net/connection.service";
import { PlayerDataModel } from "../player/playerDataModel";
import { MapDataModel } from "../map/mapDataModel";

export class BagModel extends PacketHandler implements IBaseModel {
    public static NAME: string = "BagModel";
    public initialize: boolean = false;
    private mModelDispatch: EventEmitter;
    private mConnect: ConnectionService;
    constructor(private mWorld: WorldService) {
        super();
        if (this.mWorld.modelManager) {
            this.mModelDispatch = this.mWorld.modelManager;
        }
        this.mConnect = this.mWorld.connection;
        this.mConnect.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM, this.handleAddItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM, this.handleRemoveItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS, this.handleExchangeItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE, this.handleQueryPackage);
    }

    public getInitialize(): boolean {
        return this.initialize;
    }

    /**
     * 请求某个背包的某些页的物品数据
     * @param bagId
     * @param page
     * @param perPage
     */
    public requestVirtualWorldQueryPackage(bagId: number, page?: number, perPage?: number) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
        content.id = bagId;
        content.page = page;
        content.perPage = perPage;
        this.mConnect.send(pkt);
    }

    private handleQueryPackage(packet: PBpacket) {
        const notice: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE = packet.content;
        this.initialize = true;
        this.mModelDispatch.emit(MessageType.QUERY_PACKAGE, notice);
    }

    private handleAddItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM = packet.content;
        if (content.nodetype === op_def.NodeType.ElementNodeType) {
            (this.mWorld.modelManager.getModel(MapDataModel.NAME) as MapDataModel).addPackItems(content.id, content.item);
        } else if (content.nodetype === op_def.NodeType.CharacterNodeType) {
            (this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel).addPackItems(content.id, content.item);
        }
        this.mModelDispatch.emit(MessageType.PACKAGE_ITEM_ADD, content);
    }

    private handleRemoveItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM = packet.content;
        const len = content.itemId.length;
        let model: MapDataModel | PlayerDataModel;
        if (content.nodetype === op_def.NodeType.ElementNodeType) {
            model = this.mWorld.modelManager.getModel(MapDataModel.NAME) as MapDataModel;
        } else if (content.nodetype === op_def.NodeType.CharacterNodeType) {
            model = this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        }
        for (let i = 0; i < len; i++) {
            model.removePackItems(content.id, content.itemId[i]);
        }
        this.mModelDispatch.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        this.mModelDispatch.emit(MessageType.PACKAGE_ITEM_REMOVE, content);
    }

    private handleExchangeItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS = packet.content;
        this.mModelDispatch.emit(MessageType.PACKAGE_EXCHANGE_ITEM_POS, content);
    }
}
