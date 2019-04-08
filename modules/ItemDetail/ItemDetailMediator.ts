import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ItemDetailView} from "./view/ItemDetailView";
import {op_client, op_gameconfig, op_gameconfig_01, op_virtual_world} from "../../../protocol/protocols";
import {IDisplayLoaderParam} from "../../interface/IDisplayLoaderParam";
import {PBpacket} from "net-socket-packet";
import Globals from "../../Globals";
import {ElementInfo} from "../../common/struct/ElementInfo";
import OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI;

export class ItemDetailMediator extends MediatorBase {
  private get view(): ItemDetailView {
    return this.viewComponent as ItemDetailView;
  }

  public onRegister(): void {
    super.onRegister();
    this.initView();
    this.view.m_Bt.on("up", this.onHandleBt, this);
  }

    private onHandleBt(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = param.id;
        if (param.button.length > 0) {
            content.componentId = param.button[0].node.id;
        }

        Globals.SocketManager.send(pkt);
    }

  private initView(): void {
      let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];

      let loaderParam: IDisplayLoaderParam = {animations: [param.animation], display: {texturePath: param.display[0].texturePath,
              dataPath: param.display[0].dataPath}};
      this.view.m_Icon.loadModel(loaderParam, this, null, this.onLoadComplete);

      let len = param.text.length;
      for (let i = 0; i < len; i++) {
        this.view.m_Text.text += param.text[i].text + "\n";
      }

      if (param.button.length > 0) {
          this.view.m_Bt.setText(param.button[0].text);
      }
  }

    protected onLoadComplete(): void {
        if (this.view.m_Icon) {
            this.view.m_Icon.playAnimation("idle");
        }
    }

  public onRemove(): void {
    super.onRemove();
  }
}
