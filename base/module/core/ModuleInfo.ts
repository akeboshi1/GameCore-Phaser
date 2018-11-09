import {IModuleInfo} from "../interfaces/IModuleInfo";

export class ModuleInfo implements IModuleInfo {
    protected m_Name: string;
    protected m_Data: any;

    public constructor(name: string, data: any = null) {
        this.m_Name = name;
        this.m_Data = data;
    }

    public get name(): string {
        return this.m_Name;
    }

    public get data(): any {
        return this.m_Data;
    }
}