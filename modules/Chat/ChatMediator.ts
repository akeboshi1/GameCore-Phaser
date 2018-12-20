import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ChatView} from "./view/ChatView";

export class ChatMediator extends MediatorBase {
  private get view(): ChatView {
    return this.viewComponent as ChatView;
  }

  public onRegister(): void {
    // this.view.on("open", this.openHandle, this);
  }
}
