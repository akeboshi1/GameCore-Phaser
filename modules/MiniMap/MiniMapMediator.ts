import {MediatorBase} from "../../base/module/core/MediatorBase";
import {MiniMapView} from "./view/MiniMapView";

export class MiniMapMediator extends MediatorBase {
  private get view(): MiniMapView {
    return this.viewComponent as MiniMapView;
  }

  public onRegister(): void {
  }
}
