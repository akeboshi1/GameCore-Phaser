import {ILayout} from "../interfaces/ILayout";
import {ILayoutItem} from "../interfaces/ILayoutItem";

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

    public removeItem(item: ILayoutItem): void {
        if (item == null) return;
        let  index: number = this.m_LayoutItems.indexOf(item);
        if ( index === -1) return;
        this.m_LayoutItems.splice(index, 1);
        //todo: 可以优化，只布局新加的
        this.onLayout();
    }

    public onDispose() {
        if ( this.m_LayoutItems ) {
            this.m_LayoutItems.splice(0);
        }
        this.m_LayoutItems = null;
    }

    public get size(): number {
        return this.m_LayoutItems.length;
    }
}