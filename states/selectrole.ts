import {PBpacket} from "net-socket-packet";
import {op_client, op_gateway} from "../../protocol/protocols";
import Globals from "../Globals";

export default class SelectRole extends Phaser.State {
    public create(): void {
        let pkt: PBpacket = new PBpacket(op_client.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        Globals.SocketCenter.send(pkt);
        this.game.state.start("game");
    }
}