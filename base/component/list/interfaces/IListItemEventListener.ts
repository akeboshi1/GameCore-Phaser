import {IListItemComponent} from "./IListItemComponent";

export interface IListItemEventListener {
    onTriggerOver( item: IListItemComponent );
    onTriggerOut( item: IListItemComponent );
    onTriggerDown( item: IListItemComponent );
    onTriggerUp( item: IListItemComponent );
}