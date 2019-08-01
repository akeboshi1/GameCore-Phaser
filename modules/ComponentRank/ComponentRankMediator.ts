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
    if (param && param.length > 0) {
      if (param[0].id === this.m_Param[0].id) {
        this.view.addItem(param[0]);
      }
    }
  }

  public get view(): ComponentRankView {
    return this.viewComponent;
  }
}