import {IDisposeObject} from "../../object/interfaces/IDisposeObject";
import {ILayoutItem} from "./ILayoutItem";

export interface ILayout extends IDisposeObject {
    getItem( index: number ): ILayoutItem;
    getItemByFunction( value: Function): ILayoutItem;
    addItem( item: ILayoutItem ): void;
    removeItem( item: ILayoutItem ): void;
    onLayout();
    size: number;
}
