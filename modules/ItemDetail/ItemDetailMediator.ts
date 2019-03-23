import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ItemDetailView} from "./view/ItemDetailView";

export class ItemDetailMediator extends MediatorBase {
  private get view(): ItemDetailView {
    return this.viewComponent as ItemDetailView;
  }

  public onRegister(): void {
    super.onRegister();

  }

  public onRemove(): void {
    super.onRemove();
  }
}
