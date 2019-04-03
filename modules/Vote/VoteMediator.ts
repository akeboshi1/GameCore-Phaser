import {MediatorBase} from "../../base/module/core/MediatorBase";
import {VoteView} from "./view/VoteView";
import {op_client, op_gameconfig, op_virtual_world} from "../../../protocol/protocols";
import {ElementInfo} from "../../common/struct/ElementInfo";
import Globals from "../../Globals";
import {StorageListItem} from "../Storage/view/item/StorageListItem";
import {PBpacket} from "net-socket-packet";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import {UIEvents} from "../../base/component/event/UIEvents";
import OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI;
import {VoteListItem} from "./view/item/VoteListItem";

export class VoteMediator extends MediatorBase {
  private get view(): VoteView {
    return this.viewComponent as VoteView;
  }

  public onRegister(): void {
    super.onRegister();
      this.initView();
      this.view.m_Bt.on("up", this.onBtUp, this);
  }

    private onBtUp(): void {
        let item = this.view.m_List.selectItem;

        if (item === undefined || item == null) {
          return;
        }

        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = param.id;
        content.data = [item.data];

        Globals.SocketManager.send(pkt);
        Globals.ModuleManager.destroyModule(ModuleTypeEnum.STORAGE);
    }

    private initView(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        this.renderList(param);
        if (param.button.length > 0) {
            this.view.m_Bt.setText(param.button[0].text);
        }
    }

    private renderList(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI): void {
        this.view.m_List.onClear();
        let len = param.actors.length;
        let item: VoteListItem;
        for (let i = 0; i < len; i++) {
            item = new VoteListItem(Globals.game);
            item.setEnable(true);
            item.data = param.actors[i].id;
            this.view.m_List.addItem(item);
            item.m_Text.text = param.actors[i].name;
        }
    }

  public onRemove(): void {
    super.onRemove();
  }
}
