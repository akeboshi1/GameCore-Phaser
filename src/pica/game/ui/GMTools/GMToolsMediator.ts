import { BasicMediator, Game } from "gamecore";
import { PBpacket } from "net-socket-packet";
import { ModuleName } from "structure";
import { op_virtual_world } from "pixelpai_proto";

export class GMToolsMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.GM_TOOLS_NAME, game);
    }

    show(param?: any) {
        this.game.emitter.on(this.key + "_targetUI", this.onTargetUIHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        super.show(param);
    }

    hide() {
        this.game.emitter.off(this.key + "_targetUI", this.onTargetUIHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        super.hide();
    }

    update(param?: any) {
        super.update(param);
        if (this.mView) {
            this.mView.update(param);
        }
    }

    private onCloseHandler() {
        this.hide();
    }

    private onTargetUIHandler(data: any) {
        if (!this.game) {
            return;
        }
        const { id, componentId, text } = data;
        // const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = id;
        content.componentId = componentId;
        content.strData = text;
        this.game.connection.send(pkt);
    }
}
