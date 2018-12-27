import {IModuleInfo} from "../interfaces/IModuleInfo";
import {IPhaserLoadList} from "../../../interface/IPhaserLoadList";

export class ModuleInfo implements IModuleInfo {
    protected m_LoadList: IPhaserLoadList;
    protected m_Name: string;
    protected m_Data: any;

    public constructor(name: string, data: any = null) {
        this.m_Name = name;
        this.m_Data = data;
    }

    public set loadList(value: IPhaserLoadList) {
        this.m_LoadList = value;
    }

    public get loadList(): IPhaserLoadList {
        return this.m_LoadList;
    }

    public get name(): string {
        return this.m_Name;
    }

    public get data(): any {
        return this.m_Data;
    }
}