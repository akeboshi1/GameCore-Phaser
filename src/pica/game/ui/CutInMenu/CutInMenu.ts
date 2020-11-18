import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";

export class CutInMenu extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            //  this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE, this.onMineSettlePackageHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    destroy() {
        super.destroy();
        this.unregister();
        this.event.destroy();
    }

    reqRightButton(uiid: number, btnid: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = packet.content;
        content.uiId = uiid;
        content.componentId = btnid;
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

}
