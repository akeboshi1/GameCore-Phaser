import { MineCarPanel } from "./MineCarPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { MineCar } from "./MineCar";
import { op_client } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class MineCarMediator extends BaseMediator {
  private mMineCar: MineCar;
  private readonly world: WorldService;
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
    super();
    this.world = worldService;
    this.mMineCar = new MineCar(worldService);
    this.mMineCar.register();
    this.mMineCar.on("query", this.onQueryHandler, this);
  }

  show(param?: any) {
    if (this.mView && this.mView.isShow()) {
        return;
    }
    if (!this.mView) {
      this.mView = new MineCarPanel(this.scene, this.world);
    }
    this.mView.show(param);
    this.mView.on("close", this.onCloseHandler, this);
    this.layerManager.addToUILayer(this.mView.view);
  }

  private onQueryHandler(packet: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE) {
    this.show(packet);
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
  }
}
