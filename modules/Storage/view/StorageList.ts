import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {SimpleLayout} from "../../../base/layout/core/SimpleLayout";

export class StorageList extends ListComponent {
    protected init(): void {
        this.m_Layout = new SimpleLayout(12, 3, 5, 5);
    }
}