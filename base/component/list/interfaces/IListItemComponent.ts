import {IDisposeObject} from "../../../IDisposeObject";
import {IListItemEventListener} from "./IListItemEventListener";
import {ILayoutItem} from "../../../layout/interfaces/ILayoutItem";

export interface IListItemComponent extends IDisposeObject, ILayoutItem {
    data: any;
    index: number;
    getView(): any;
    setSelect( value: boolean );
    setEnable( value: boolean );
    setEventListener( listener: IListItemEventListener );
    onAdded(): void;
}