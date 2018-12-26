import {IModuleLoadList} from "./IModuleLoadList";

export interface IModuleInfo {
    name: string;
    data: any;
    loadList: IModuleLoadList;
}