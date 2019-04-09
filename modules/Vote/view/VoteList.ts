import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {SimpleLayout} from "../../../base/layout/core/SimpleLayout";
import {IListItemComponent} from "../../../base/component/list/interfaces/IListItemComponent";
import {UIEvents} from "../../../base/component/event/UIEvents";
import {VoteListItem} from "./item/VoteListItem";

export class VoteList extends ListComponent {
    protected init(): void {
        this.m_Layout = new SimpleLayout(4, 2, 24, 45);
    }

    public onTriggerUp(item: IListItemComponent) {
        let voteItem: VoteListItem = item as VoteListItem;
        if (voteItem.getSelect()) {
            item.setSelect(false);
        } else {
            item.setSelect(true);
        }
        this.emit(UIEvents.LIST_ITEM_UP, item);
    }
}