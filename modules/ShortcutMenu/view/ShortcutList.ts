import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {SimpleLayout} from "../../../base/layout/core/SimpleLayout";

export class ShortcutList extends ListComponent {
    protected init(): void {
        this.m_Layout = new SimpleLayout(999, 1, 2);
    }
}