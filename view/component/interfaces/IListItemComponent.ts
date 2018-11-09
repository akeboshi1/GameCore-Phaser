interface IListItemComponent extends IDisposeObject {
    data;
    index;
    getView(): PIXI.DisplayObject;
    setSelect( value: boolean );
    setEnable( value: boolean );
    setEventListener( listener: IListItemEventListener );
}