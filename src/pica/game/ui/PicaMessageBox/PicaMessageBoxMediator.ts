import { op_virtual_world, op_client } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";

export class PicaMessageBoxMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.PICAMESSAGEBOX_NAME, game);
  }

  show(param?: any) {
    super.show(param);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_click", this.onClickHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.hide, this);
  }

  hide() {
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_click", this.onClickHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_hide", this.hide, this);
    super.hide();
  }

  private onClickHandler(data) {
    if (data.local) {
      if (data.clickhandler) data.clickhandler.run();
      this.hide();
    } else {
      const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam;
      const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
      const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
      content.uiId = param.id;
      content.componentId = data.node.id;
      this.game.connection.send(pkt);
    }

  }
}
