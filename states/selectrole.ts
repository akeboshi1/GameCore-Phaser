import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../protocol/protocols";
import Globals from "../Globals";
import {MessageType} from "../common/const/MessageType";

export default class SelectRole extends Phaser.State {
    public create(): void {
        if (Globals.DataCenter.PlayerData.characterId > 0) {
            this.onSelectCharacter();
        } else {
            Globals.MessageCenter.on(MessageType.PLAYER_SELECT_CHARACTER, this.onSelectCharacter);
        }
    }

    private onSelectCharacter(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        Globals.SocketManager.send(pkt);
        this.game.state.start("game");
    }
}