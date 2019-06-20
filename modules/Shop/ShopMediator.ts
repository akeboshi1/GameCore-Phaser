import { MediatorBase } from "../../base/module/core/MediatorBase";

export class ShopMediator extends MediatorBase {
  get view(): ShopMediator {
    return <ShopMediator>this.viewComponent;
  }

  onRegister() {
    super.onRegister();
  }

  onRemove() {
    super.onRemove();
  }
}