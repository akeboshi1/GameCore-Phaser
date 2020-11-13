import { PicaMineCar } from "./PicaMineCar";
import { op_pkt_def, op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";

export class PicaMineCarMediator extends BasicMediator {
  constructor(game: Game) {
    super(ModuleName.PICAMINECAR_NAME, game);
    this.mModel = new PicaMineCar(this.game);
    this.addLisenter();
    this.game.emitter.on("packageCategory", this.onPackageCategoryHandler, this);
  }

  show(param?: any) {
    super.show(param);

    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querypackage", this.onQueryPackage, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querycategory", this.onQueryCategoryHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.on(RENDER_PEER + "_" + this.key + "_discard", this.onDiscardHandler, this);
  }

  hide() {
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querypackage", this.onQueryPackage, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querycategory", this.onQueryCategoryHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    this.game.emitter.off(RENDER_PEER + "_" + this.key + "_discard", this.onDiscardHandler, this);

    super.hide();
  }

  destroy() {
    this.game.emitter.off("packageCategory", this.onPackageCategoryHandler, this);
    this.removeLisenter();
    super.destroy();
  }
  get playerData() {
    const bag = this.bag;
    if (bag) {
      return bag.playerBag;
    }
    return null;
  }

  get bag() {
    const user = this.game.user;
    if (!user || !user.userData) {
      return;
    }
    return user.userData;
  }

  private addLisenter() {
    if (!this.bag) return;
    const mgr = this.bag;
    if (mgr) {
      this.game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
      this.game.emitter.on(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
    }
  }

  private removeLisenter() {
    if (!this.bag) return;
    const mgr = this.bag;
    if (mgr) {
      this.game.emitter.off(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
      this.game.emitter.off(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
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

  private onQueryCategoryHandler() {
    this.model.getCategories(op_pkt_def.PKT_PackageType.MinePackage);
  }
  private onQueryPackage(data: { type: op_pkt_def.PKT_PackageType, key: string }) {
    if (this.playerData) {
      const bag = this.playerData.mineBag;
      const items = this.playerData.getItemsByCategory(data.type, data.key);
      this.mView.setProp(items, bag.limit);
    }
  }
  private onDiscardHandler(items: any[]) {
    if (this.model) {
      this.model.discard(items);
    }
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.hide();
      this.mView = undefined;
    }
    this.mShow = false;
  }
  private get model(): PicaMineCar {
    return (<PicaMineCar>this.mModel);
  }
}
