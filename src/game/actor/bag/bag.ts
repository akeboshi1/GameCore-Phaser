import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { MessageType } from "../../../messageType/MessageType";
import { World } from "../../world";

export class Bag extends PacketHandler {
    private mInitialize: boolean;
    constructor(private mWorld: World) {
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

    public requestVirtualWorldQueryPackage(bagId: number, page?: number, perPage?: number) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
        content.id = bagId;
        content.page = page;
        content.perPage = perPage;
        this.mWorld.connection.send(pkt);
    }

    private handleQueryPackage(packet: PBpacket) {
        this.mInitialize = true;
        this.mWorld.emit(MessageType.QUERY_PACKAGE, packet);
    }

    private handleAddItem(packet: PBpacket): void {
        this.mWorld.peer.emit(MessageType.PACKAGE_ITEM_ADD, packet);
    }

    private handleRemoveItem(packet: PBpacket): void {
        this.mWorld.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        this.mWorld.emit(MessageType.PACKAGE_ITEM_REMOVE, packet);
    }

    private handleExchangeItem(packet: PBpacket): void {
        this.mWorld.emit(MessageType.PACKAGE_EXCHANGE_ITEM_POS, packet);
    }

}
