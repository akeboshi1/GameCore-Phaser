import {IListItemEventListener} from "./IListItemEventListener";
import {IDisposeObject} from "../../../IDisposeObject";
import {IListItemComponent} from "./IListItemComponent";

export interface IListComponent extends  IListItemEventListener, IDisposeObject {
     addItem( item: IListItemComponent);
     removeItem( item: IListItemComponent);
     getItem( index: number ): IListItemComponent;
     getItemByFunction( value: Function ): IListItemComponent;
     selectIndex( index: number );
}