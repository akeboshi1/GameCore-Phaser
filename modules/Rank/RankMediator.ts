import { MediatorBase } from "../../base/module/core/MediatorBase";
import { RankView } from "./view/RankView";

export class RankMediator extends MediatorBase {
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

  public get view(): RankView {
    return this.viewComponent;
  }
}