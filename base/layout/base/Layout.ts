import {ILayout} from "../interfaces/ILayout";
import {ILayoutItem} from "../interfaces/ILayoutItem";
import {IListItemComponent} from "../../component/list/interfaces/IListItemComponent";

export class Layout implements ILayout {
    protected m_LayoutItems: Array<ILayoutItem>;

    public constructor() {
        this.m_LayoutItems = new Array<ILayoutItem>();
    }

    public onLayout(): void {}

    public addItem(item: ILayoutItem): void {
        if (item == null) return;
        this.m_LayoutItems.push(item);
        //todo: 可以优化，只布局新加的
        this.onLayout();
    }

    public getItem(index: number): ILayoutItem {
        if (this.m_LayoutItems.length > index && this.m_LayoutItems) return this.m_LayoutItems[index];
        return null;
    }

    public getItemByFunction(filterFunction: Function): ILayoutItem {
        let item: ILayoutItem = null;
        let len: number = this.m_LayoutItems.length;
        for (let i = 0; i < len; i++) {
            item = this.m_LayoutItems[i];
            if (filterFunction(item)) {
                return item;
            }
        }
        return null;
    }

    public removeItem(item: ILayoutItem): void {
        if (item == null) return;
        let  index: number = this.m_LayoutItems.indexOf(item);
        if ( index === -1) return;
        this.m_LayoutItems.splice(index, 1);
        //todo: 可以优化，只布局新加的
        this.onLayout();
    }

    public onClear() {
        let len = this.m_LayoutItems.length;
        for (let i = 0; i < len; i++) {
            this.m_LayoutItems[i].onDispose();
        }
        this.m_LayoutItems.length = 0;
    }

    public onDispose() {
        let len = this.m_LayoutItems.length;
        for (let i = 0; i < len; i++) {
            this.m_LayoutItems[i].onDispose();
        }
        this.m_LayoutItems = null;
    }

    public get size(): number {
        return this.m_LayoutItems.length;
    }
}