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
        let len = param.text.length;
        for (let i = 0; i < len; i++) {
            this.view.m_Desc.text += param.text[i].text + "\n";
        }
    }

    private renderList(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI): void {
        this.view.m_List.onClear();
        let len = param.actors.length;
        let item: VoteResultListItem;
        for (let i = 0; i < len; i++) {
            item = new VoteResultListItem(Globals.game);
            item.data = param.actors[i];
            this.view.m_List.addItem(item);
            item.m_NumTxt.text = param.data[i] + "票";
        }
    }

  public onRemove(): void {
    super.onRemove();
  }
}
