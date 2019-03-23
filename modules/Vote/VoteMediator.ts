import {MediatorBase} from "../../base/module/core/MediatorBase";
import {VoteView} from "./view/VoteView";

export class VoteMediator extends MediatorBase {
  private get view(): VoteView {
    return this.viewComponent as VoteView;
  }

  public onRegister(): void {
    super.onRegister();

  }

  public onRemove(): void {
    super.onRemove();
  }
}
