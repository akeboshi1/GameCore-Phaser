import { MineCarPanel } from "./MineCarPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { MineCar } from "./MineCar";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class MineCarMediator extends BaseMediator {
  protected mView: MineCarPanel;
  private mMineCar: MineCar;
  private readonly world: WorldService;
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
    super();
    this.world = worldService;
  }

  show(param?: any) {
    if (this.mShow) {
      this.addLisenter();
      return;
    }
    super.show(param);
    if (!this.mView) {
      this.mView = new MineCarPanel(this.scene, this.world);
      this.mView.on("querypackage", this.onQueryPackage, this);
      this.mView.on("querycategory", this.onQueryCategoryHandler, this);
    }
    if (!this.mMineCar) {
      this.mMineCar = new MineCar(this.world);
      this.mMineCar.register();
      // this.mMineCar.on("query", this.onQueryHandler, this);
      this.mMineCar.on("packageCategory", this.onPackageCategoryHandler, this);
    }
    this.mView.show(param);
    this.mView.on("close", this.onCloseHandler, this);
    this.mView.on("discard", this.onDiscardHandler, this);
    this.layerManager.addToUILayer(this.mView);
    this.addLisenter();
  }
  destroy() {
    this.mShow = false;
    if (this.mMineCar) {
      // this.mMineCar.off("query", this.onQueryHandler, this);
      this.mMineCar.off("packageCategory", this.onPackageCategoryHandler, this);
      this.mMineCar.unregister();
      this.mMineCar.destroy();
      this.mMineCar = null;
    }
    super.destroy();
    this.removeLisenter();
  }
  get playerData() {
    if (this.world.roomManager && this.world.roomManager.currentRoom) {
      return this.world.roomManager.currentRoom.playerDataManager.playerData;
    }
    return null;
  }
  private addLisenter() {
    if (!this.world.roomManager.currentRoom) return;
    const mgr = this.world.roomManager.currentRoom.playerDataManager;
    if (mgr) {
      mgr.on("syncfinish", this.onSyncFinishHandler, this);
      mgr.on("update", this.onUpdateHandler, this);
    }
  }

  private removeLisenter() {
    if (!this.world.roomManager.currentRoom) return;
    const mgr = this.world.roomManager.currentRoom.playerDataManager;
    if (mgr) {
      mgr.off("syncfinish", this.onSyncFinishHandler, this);
      mgr.off("update", this.onUpdateHandler, this);
    }
  }

  private onSyncFinishHandler() {
    if (this.mView) this.mView.queryRefreshPackage();
  }

  private onUpdateHandler() {
    if (this.mView) this.mView.queryRefreshPackage();
  }

  private onPackageCategoryHandler(subcategory: op_def.IStrPair[]) {
    if (!this.mView) {
      return;
    }
    this.mView.setCategoriesData(subcategory);
  }
  // private onQueryHandler(packet: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE) {
  //   this.update(packet);
  // }

  private onQueryCategoryHandler() {
    this.mMineCar.getCategories(op_pkt_def.PKT_PackageType.MinePackage);
  }
  private onQueryPackage(packType: op_pkt_def.PKT_PackageType, key: string) {
    if (this.playerData) {
      const bag = this.playerData.mineBag;
      const items = this.playerData.getItemsByCategory(packType, key);
      this.mView.setProp(items, bag.limit);
    }
  }
  private onDiscardHandler(items: any[]) {
    if (this.mMineCar) {
      this.mMineCar.discard(items);
    }
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.hide();
      this.mView = undefined;
    }
    this.mShow = false;
  }
}
