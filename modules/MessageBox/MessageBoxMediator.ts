import { MediatorBase } from "../../base/module/core/MediatorBase";
import { MessageBoxView } from "./view/MessageBoxView";
import { op_client } from "pixelpai_proto";

export class MessageBoxMediator extends MediatorBase {
  get view(): MessageBoxView {
    return <MessageBoxView>this.viewComponent;
  }

  public onRegister() {
    this.initView();
    super.onRegister();
  }

  public onRemove() {
    super.onRemove();
  }

  private initView(): void {
    let param: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.param[0];
    this.view.setContext(param);
  }
}