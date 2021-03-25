import { BasicMediator, Game } from "gamecore";
import { PBpacket } from "net-socket-packet";
import { ModuleName } from "structure";
import { op_virtual_world } from "pixelpai_proto";

export class DropElementMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICA_DROP_ELEMENT_NAME, game);
    }

    public setParam(param) {
        super.setParam(param);
        if (this.mView) this.mView.update(param);
    }

    public drop() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_HIDE_SHOW_OFF_ITEM);
        this.game.connection.send(packet);
    }
}
