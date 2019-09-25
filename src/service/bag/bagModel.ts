import { IBaseModel } from "../baseModel";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { WorldService } from "../../game/world.service";
import { EventEmitter } from "events";
import { MessageType } from "../../const/MessageType";

export class BagModel extends PacketHandler implements IBaseModel {
    public static NAME: string = "BagModel";
    public initialize: boolean = false;
    private mModelDispatch: EventEmitter;
    constructor(private mWorld: WorldService) {
        super();
        if (this.mWorld.modelManager) {
            this.mModelDispatch = this.mWorld.modelManager;
        }
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM, this.handleAddItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM, this.handleRemoveItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS, this.handleExchangeItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE, this.handleQueryPackage);
    }

    public getInitialize(): boolean {
        return this.initialize;
    }

    private handleQueryPackage(packet: PBpacket) {
        const notice: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE = packet.content;
        this.initialize = true;
        this.mModelDispatch.emit(MessageType.QUERY_PACKAGE, notice);
    }

    private handleAddItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM = packet.content;
        if (content.nodetype === op_def.NodeType.ElementNodeType) {
            // Globals.DataCenter.SceneData.mapInfo.addElementPackItems(content.id, content.item);
        } else if (content.nodetype === op_def.NodeType.CharacterNodeType) {
            // Globals.DataCenter.PlayerData.addCharacterPackItems(content.id, content.item);
        }
        this.mModelDispatch.emit(MessageType.PACKAGE_ITEM_ADD, content);
    }

    private handleRemoveItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM = packet.content;
        const len = content.itemId.length;
        for (let i = 0; i < len; i++) {
            if (content.nodetype === op_def.NodeType.ElementNodeType) {
                //  Globals.DataCenter.SceneData.mapInfo.removeElementPackItems(content.id, content.itemId[i]);
            } else if (content.nodetype === op_def.NodeType.CharacterNodeType) {
                //  Globals.DataC.enter.PlayerData.removeCharacterPackItems(content.id, content.itemId[i]);
            }
        }
        this.mModelDispatch.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        this.mModelDispatch.emit(MessageType.PACKAGE_ITEM_REMOVE, content);
    }

    private handleExchangeItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS = packet.content;
        this.mModelDispatch.emit(MessageType.PACKAGE_EXCHANGE_ITEM_POS, content);
    }
}
