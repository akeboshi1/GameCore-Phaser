import {IListItemComponent} from "./IListItemComponent";

export interface IListItemEventListener {
    onTriggerClick( item: IListItemComponent );
}