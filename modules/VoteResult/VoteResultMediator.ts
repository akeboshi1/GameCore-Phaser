import {MediatorBase} from "../../base/module/core/MediatorBase";
import {VoteResultView} from "./view/VoteResultView";
import {op_client} from "pixelpai_proto";
import Globals from "../../Globals";
import {VoteResultListItem} from "./view/item/VoteResultListItem";
import {Tick} from "../../common/tick/Tick";

export class VoteResultMediator extends MediatorBase {
    private mTick: Tick;

    private get view(): VoteResultView {
        return this.viewComponent as VoteResultView;
    }

    public onRegister(): void {
        super.onRegister();
        this.initView();

        this.mTick = new Tick(60);
        this.mTick.setRenderCallBack(this.onFrame, this);
        this.mTick.start();
    }

    public onFrame(): void {
        let len = this.view.m_List.getLength();
        let item: VoteResultListItem;
        for (let i = 0; i < len; i++) {
            item = this.view.m_List.getItem(i) as VoteResultListItem;
            item.m_Avatar.onFrame();
        }
    }

    private initView(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        this.renderList(param);
        if (param.text.length > 0) {
            this.view.setDesc(param.text[0].text);
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
        let len = this.view.m_List.getLength();
        let item: VoteResultListItem;
        for (let i = 0; i < len; i++) {
            item = this.view.m_List.getItem(i) as VoteResultListItem;
            item.onDispose();
        }
        if (this.mTick) {
            this.mTick.onDispose();
            this.mTick = null;
        }
        super.onRemove();
    }
}
