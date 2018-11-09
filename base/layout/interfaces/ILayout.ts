interface ILayout extends IDisposeObject {
    getItem( index: number ): ILayoutItem;
    addItem( item: ILayoutItem ): void;
    removeItem( item: ILayoutItem ): void;
    onLayout();
}