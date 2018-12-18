import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../../protocol/protocols";
import {MessageType} from "../const/MessageType";
import {BasePacketHandler} from "./BasePacketHandler";

export class GameService extends BaseSingleton {
    public register(): void {
        Globals.SocketManager.addHandler(new Handler());
    }
}

class Handler extends BasePacketHandler {
    constructor() {
        super();
        // Server
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.handleSelectCharacter);
    }

    private handleSelectCharacter(packet: PBpacket): void {
        let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER = packet.content;
        Globals.DataCenter.PlayerData.setMainPlayerInfo(character.character);
    }
}