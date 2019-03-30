import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {SimpleLayout} from "../../../base/layout/core/SimpleLayout";

export class VoteResultList extends ListComponent {
    protected init(): void {
        this.m_Layout = new SimpleLayout(3, 3, 24, 45);
    }
}