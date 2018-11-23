import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "../../protocol/protocols";
import Globals from "../Globals";

export default class SelectRole extends Phaser.State {
    public create(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        Globals.SocketCenter.send(pkt);
        this.game.state.start("game");
    }
}