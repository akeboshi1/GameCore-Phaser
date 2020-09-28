import { ILayerManager } from "../Layer.manager";
import { PicaMessageBoxPanel } from "./PicaMessageBoxPanel";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";

export class PicaMessageBoxMediator extends BaseMediator {
  private scene: Phaser.Scene;
  private world: WorldService;
  constructor(
    private layerManager: ILayerManager,
    scene: Phaser.Scene,
    worldService: WorldService
  ) {
    super();
    this.world = worldService;
    this.scene = this.layerManager.scene;
  }

  show(params?: any) {
    this.mParam = params;
    if ((this.mView && this.mView.isShow()) || this.mShow) {
      return;
    }
    if (!this.mView) {
      this.mView = new PicaMessageBoxPanel(this.scene, this.world);
      this.mView.on("click", this.onClickHandler, this);
    }
    this.mView.show(params);
    this.layerManager.addToDialogLayer(this.mView);
  }

  hide() {
    super.hide();
    super.destroy();
  }

  private onClickHandler(data) {
    if (data.local) {
      if (data.clickhandler) data.clickhandler.run();
      this.hide();
    } else {
      const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
      const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
      const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
      content.uiId = param.id;
      content.componentId = data.node.id;
      this.world.connection.send(pkt);
    }

  }
}
