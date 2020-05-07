import { Data } from "phaser";

export interface IListItemComponent {
    index: number;
    getView(): any;
    dataChange(val: any): any;
}
