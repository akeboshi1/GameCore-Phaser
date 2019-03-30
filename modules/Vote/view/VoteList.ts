import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {SimpleLayout} from "../../../base/layout/core/SimpleLayout";

export class VoteList extends ListComponent {
    protected init(): void {
        this.m_Layout = new SimpleLayout(4, 2, 24, 45);
    }
}