import {MediatorBase} from "../../base/module/core/MediatorBase";
import {VoteView} from "./view/VoteView";
import {op_client, op_virtual_world} from "../../../protocol/protocols";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI;
import {VoteListItem} from "./view/item/VoteListItem";
import {Tick} from "../../common/tick/Tick";

export class VoteMediator extends MediatorBase {
  private mTick: Tick;
  private get view(): VoteView {
    return this.viewComponent as VoteView;
  }

  public onRegister(): void {
      super.onRegister();
      this.initView();
      this.view.m_Bt.on("up", this.onBtUp, this);

      this.mTick = new Tick(60);
      this.mTick.setRenderCallBack(this.onFrame, this);
      this.mTick.start();
  }

    public onFrame(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        if (param.time.length > 0) {
            let leftT = param.time[0] - Globals.DataCenter.getCurrentTime();
            this.view.m_TimeTxt.text = Globals.Tool.formatLeftTime(leftT / 1000);
        }
        let len = this.view.m_List.getLength();
        let item: VoteListItem;
        for (let i = 0; i < len; i++) {
            item = this.view.m_List.getItem(i) as VoteListItem;
            item.m_Avatar.onFrame();
        }
    }

    private onBtUp(): void {
        let len = this.view.m_List.getLength();
        let item: VoteListItem;
        let selectIds: number[] = [];
        for (let i = 0; i < len; i++) {
            item = this.view.m_List.getItem(i) as VoteListItem;
            if (item.getSelect()) {
                selectIds.push(item.data.id);
            }
        }

        if (selectIds.length === 0) {
            return;
        }

        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = param.id;
        content.data = selectIds;

        Globals.SocketManager.send(pkt);
    }

    private initView(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        this.renderList(param);
        if (param.button.length > 0) {
            this.view.m_Bt.setText(param.button[0].text);
        }
        if (param.time.length > 0) {
            this.view.m_TimeTxt.text = Globals.Tool.formatLeftTime(param.time[0]);
        }
    }

    private renderList(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI): void {
        this.view.m_List.onClear();
        let len = param.actors.length;
        let item: VoteListItem;
        for (let i = 0; i < len; i++) {
            item = new VoteListItem(Globals.game);
            item.setEnable(true);
            item.data = param.actors[i];
            this.view.m_List.addItem(item);
        }
    }

  public onRemove(): void {
      let len = this.view.m_List.getLength();
      let item: VoteListItem;
      for (let i = 0; i < len; i++) {
          item = this.view.m_List.getItem(i) as VoteListItem;
          item.onDispose();
      }
      if (this.mTick) {
          this.mTick.onDispose();
          this.mTick = null;
      }
      super.onRemove();
  }
}
