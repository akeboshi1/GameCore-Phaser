import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";

export class BagMediator extends PacketHandler {
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM, this.handleAddItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ITEM, this.handleRemoveItem);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS, this.handleExchangeItem);
    }

    private handleAddItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ITEM = packet.content;
        if (content.nodetype === op_def.NodeType.ElementNodeType) {
           // Globals.DataCenter.SceneData.mapInfo.addElementPackItems(content.id, content.item);
        } else if (content.nodetype === op_def.NodeType.CharacterNodeType) {
           // Globals.DataCenter.PlayerData.addCharacterPackItems(content.id, content.item);
        }
       /// Globals.MessageCenter.emit(MessageType.PACKAGE_ITEM_ADD, content);
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
       // Globals.MessageCenter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
      //  Globals.MessageCenter.emit(MessageType.PACKAGE_ITEM_REMOVE, content);
    }

    private handleExchangeItem(packet: PBpacket): void {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EXCHANGE_ITEM_POS = packet.content;
        // Globals.MessageCenter.emit(MessageType.PACKAGE_EXCHANGE_ITEM_POS, content);
    }



}
