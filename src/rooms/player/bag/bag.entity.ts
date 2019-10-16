import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../../game/world.service";
import { IEntity } from "../../entity";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { MessageType } from "../../../const/MessageType";

export class BagEntity extends PacketHandler implements IEntity {
    private mInitialize: boolean;
    constructor(private mWorld: WorldService) {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM, this.handleAddItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM, this.handleRemoveItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS, this.handleExchangeItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE, this.handleQueryPackage);
    }

    initialize(): boolean {
        return this.mInitialize;
    }

    public register() {
        this.mWorld.connection.addPacketListener(this);
    }

    public unRegister() {
        this.mWorld.connection.removePacketListener(this);
    }

    public destroy() {
        this.mInitialize = false;
        this.mWorld.connection.removePacketListener(this);
    }

    private handleQueryPackage(packet: PBpacket) {
        const notice: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE = packet.content;
        this.mInitialize = true;
        this.mWorld.emitter.emit(MessageType.QUERY_PACKAGE, notice);
    }

    private handleAddItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM = packet.content;
        if (content.nodetype === op_def.NodeType.ElementNodeType) {
            this.mWorld.roomManager.currentRoom.getMapEntity().addPackItems(content.id, content.item);
        } else if (content.nodetype === op_def.NodeType.CharacterNodeType) {
            this.mWorld.roomManager.currentRoom.playerManager.addPackItems(content.id, content.item);
        }
        this.mWorld.emitter.emit(MessageType.PACKAGE_ITEM_ADD, content);
    }

    private handleRemoveItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM = packet.content;
        const len = content.itemId.length;
        for (let i = 0; i < len; i++) {
            this.mWorld.roomManager.currentRoom.playerManager.removePackItems(content.id, content.itemId[i]);
        }
        this.mWorld.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        this.mWorld.emitter.emit(MessageType.PACKAGE_ITEM_REMOVE, content);
    }

    private handleExchangeItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS = packet.content;
        this.mWorld.emitter.emit(MessageType.PACKAGE_EXCHANGE_ITEM_POS, content);
    }

}
