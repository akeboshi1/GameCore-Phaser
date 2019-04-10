import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ControlFView} from "./view/ControlFView";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {PBpacket} from "net-socket-packet";
import Globals from "../../Globals";
import IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN;

export class ControlFMediator extends MediatorBase {

  private get view(): ControlFView {
    return this.viewComponent as ControlFView;
  }

  public onRegister(): void {
    this.initView();
    this.view.bt.on("up", this.onHandleBt, this);
  }

    public onRemove(): void {
        this.view.bt.cancel("up", this.onHandleBt);
        super.onRemove();
    }

  private initView(): void {
      let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
      if (param.text.length > 0) {
          this.view.setName(param.text[0].text);
      }
      if (param.text.length > 1) {
        this.view.setDesc(param.text[1].text);
      }
  }

  private onHandleBt(): void {
      let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
      let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
      let keyArr: number[] = Globals.Keyboard.getKeyDowns();
      keyArr = keyArr.concat(Phaser.Keyboard.F);
      content.keyCodes = keyArr;
      Globals.SocketManager.send(pkt);
  }
}
