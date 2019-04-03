import {MediatorBase} from "../../base/module/core/MediatorBase";
import {VoteResultView} from "./view/VoteResultView";
import {op_client} from "../../../protocol/protocols";
import Globals from "../../Globals";
import {VoteResultListItem} from "./view/item/VoteResultListItem";

export class VoteResultMediator extends MediatorBase {
  private get view(): VoteResultView {
    return this.viewComponent as VoteResultView;
  }

  public onRegister(): void {
    super.onRegister();
      this.initView();
  }

    private initView(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        this.renderList(param);
    }

    private renderList(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI): void {
        this.view.m_List.onClear();
        let len = param.text.length;
        let item: VoteResultListItem;
        for (let i = 0; i < len; i++) {
            item = new VoteResultListItem(Globals.game);
            item.setEnable(true);
            item.data = param.text[i].node.id;
            this.view.m_List.addItem(item);
            item.setSelect(true);
            item.m_NumTxt.text = param.data[i] + "票";
            item.m_Text.text = param.text[i].text;
        }
    }

  public onRemove(): void {
    super.onRemove();
  }
}
