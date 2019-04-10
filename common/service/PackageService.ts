import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {BasePacketHandler} from "./BasePacketHandler";
import {op_client} from "pixelpai_proto";
import {PBpacket} from "net-socket-packet";
import {MessageType} from "../const/MessageType";

export class PackageService extends BaseSingleton  {
    private handle: Handler;

    public register(): void {
        this.handle = new Handler();
        Globals.SocketManager.addHandler(this.handle);
    }

    public unRegister(): void {
        Globals.SocketManager.removeHandler(this.handle);
    }
}

class Handler extends BasePacketHandler {
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM, this.handleAddItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM, this.handleRemoveItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS, this.handleExchangeItem);
    }

    private handleAddItem(packet: PBpacket): void {
        let content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM = packet.content;
        Globals.MessageCenter.emit(MessageType.PACKAGE_ITEM_ADD, content);
    }

    private handleRemoveItem(packet: PBpacket): void {
        let content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM = packet.content;
        Globals.MessageCenter.emit(MessageType.PACKAGE_ITEM_REMOVE, content);
    }

    private handleExchangeItem(packet: PBpacket): void {
        let content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS = packet.content;
        Globals.MessageCenter.emit(MessageType.PACKAGE_EXCHANGE_ITEM_POS, content);
    }

}
