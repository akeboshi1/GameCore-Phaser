import {SimpleLayout} from "../../../layout/core/SimpleLayout";
import {IListItemComponent} from "../interfaces/IListItemComponent";
import {ILayout} from "../../../layout/interfaces/ILayout";
import {HashMap} from "../../../ds/HashMap";
import {IListComponent} from "../interfaces/IListComponent";

export class ListComponent extends Phaser.Group implements IListComponent {
    protected m_Layout: ILayout;
    protected m_SelectItem: IListItemComponent;

    constructor( game: Phaser.Game ) {
        super( game );
        this.init();
    }

    protected init(): void {
        this.m_Layout = new SimpleLayout();
    }

    public setLayout( layout: ILayout ): void {
        this.m_Layout = layout;
    }

    public addItem(item: IListItemComponent) {
        if ( null == item ) return;
        if ( null == this.m_Layout ) return;
        item.setEventListener(this);
        item.index = this.m_Layout.size + 1;
        this.m_Layout.addItem( item );
        item.onAdded();
        this.add(item.getView());
    }

    public removeItem(item: IListItemComponent) {
        if ( null == item ) return;
        if ( null == this.m_Layout ) return;
        this.remove(item.getView(), true);
        this.m_Layout.removeItem( item );
        item.onDispose();
    }

    public getItem(index: number): IListItemComponent {
        return this.m_Layout.getItem(index) as IListItemComponent;
    }

    public getLength(): number {
        return this.m_Layout.size;
    }

    public getItemByFunction(filterFunction: Function): IListItemComponent {
        return this.m_Layout.getItemByFunction(filterFunction) as IListItemComponent;
    }

    public onTriggerClick(item: IListItemComponent) {
        if ( this.m_SelectItem && this.m_SelectItem !== item ) {
            this.m_SelectItem.setSelect( false );
        }
        this.m_SelectItem = item;
        this.m_SelectItem.setSelect( true ) ;
    }

    public selectIndex(index: number) {
    }

    public onDispose(): void {

    }
}
