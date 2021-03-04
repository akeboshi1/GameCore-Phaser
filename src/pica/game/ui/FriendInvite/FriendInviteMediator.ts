import { op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";

export class FriendInviteMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.FRIEND_INVITE, game);
    }

    public targetUI(uiId, componentId) {
        // const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiId;
        content.componentId = componentId;
        this.game.connection.send(pkt);
        this.hide();
    }

    private onHideHandler() {
        this.destroy();
    }
}
