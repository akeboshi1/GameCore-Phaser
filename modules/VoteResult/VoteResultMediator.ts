import {MediatorBase} from "../../base/module/core/MediatorBase";
import {VoteResultView} from "./view/VoteResultView";

export class VoteResultMediator extends MediatorBase {
  private get view(): VoteResultView {
    return this.viewComponent as VoteResultView;
  }

  public onRegister(): void {
    super.onRegister();

  }

  public onRemove(): void {
    super.onRemove();
  }
}
