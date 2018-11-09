import {HashMap} from "../../../scene/util/HashMap";
import {SimpleLayout} from "../../../base/layout/core/SimpleLayout";

export class ListComponent extends Phaser.Group implements IListComponent {
    protected m_Layout: ILayout;
    protected m_ItemList: HashMap = new HashMap;
    protected m_SelectItem: IListItemComponent;

    public setLayout( layout: ILayout ): void {
        this.m_Layout = layout;
    }

    public addItem(item: IListItemComponent) {
        if ( null == item ) return;
        item.setEventListener(this);

        if (this.m_Layout == null) {
            this.m_Layout = new SimpleLayout();
        }
    }

    public removeItem(item: IListItemComponent) {
    }

    public getItem(index: number): IListItemComponent {
        return this.m_ItemList.getValue(index);
    }

    public getItemByFunction(filterFunction: Function): IListItemComponent {
        let item: IListItemComponent = null;
        let i: number = 0;
        for (; i < this.m_ItemList.valueList.length; i++) {
            item = this.m_ItemList.valueList[i];
            if (filterFunction(item)) {
                return item;
            }
        }
        return null;
    }

    public onTriggerClick(item: IListItemComponent) {
    }

    public selectIndex(index: number) {
    }

    public onDispose(): void {

    }
}