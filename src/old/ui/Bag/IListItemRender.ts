
export interface IListItemComponent {
    index: number;
    getView(): any;
    dataChange(val: any): any;
}
