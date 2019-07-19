import { MediatorBase } from "../../base/module/core/MediatorBase";

export class UserInfoMediator extends MediatorBase {
  onRegister() {
    this.initView();
    super.onRegister();
  }

  onRemove() {
    super.onRemove();
  }

  private initView() {
    console.log(this.param);
  }

  get view(): UserInfoMediator {
    return this.viewComponent;
  }
}