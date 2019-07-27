import { MediatorBase } from "../../base/module/core/MediatorBase";
import { ComponentRankView } from "./view/ComponentRankView";

export class ComponentRankMediator extends MediatorBase {
  onRegister() {
    this.initView();
    super.onRegister();
  }

  onRemove() {
    super.onRemove();
  }

  private initView() {
    if (this.param && this.param.length > 0) {
      this.view.addItem(this.param[0]);
    }
  }

  update(param: any) {
    this.initView();
  }

  public get view(): ComponentRankView {
    return this.viewComponent;
  }
}