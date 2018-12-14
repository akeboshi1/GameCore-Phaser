import {IModuleManager} from "../../base/module/interfaces/IModuleManager";
import BaseSingleton from "../../base/BaseSingleton";
import {IModule} from "../../base/module/interfaces/IModule";
import {IModuleInfo} from "../../base/module/interfaces/IModuleInfo";
import {HashMap} from "../../base/ds/HashMap";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";


export class ModuleManager extends BaseSingleton implements IModuleManager {
    private CLASS_NAME_SUFFIX: string = "Module";
    protected m_ModuleList: HashMap;

    constructor() {
        super();
        this.m_ModuleList = new HashMap();
    }

    public openModule( moduleName: string, param?: any ): void {
        let module: IModuleInfo = {
            name: moduleName,
            data: param
        };
        this.createModule( module );
    }

    private createModule(info: IModuleInfo, callBack?: Function): void {
        if (null == info) return;
        let moduleName: string = info.name;
        let module: IModule = this.getModule(moduleName);
        if (module) {
            module.recover();
        } else {
            let className: string = info.name + this.CLASS_NAME_SUFFIX;
            let ns: any = require("../../modules/" + info.name + "/" + className + ".ts");
            module = new ns[className]();
            module.setParam(info.data);
            module.name = info.name;
            this.m_ModuleList.add(info.name, module);
            module.startUp();
        }
    }

    public destroyModule(moduleName: string): void {
        let module: IModule = this.m_ModuleList.remove(moduleName);
        if ( module ) {
            module.onDispose();
        }
    }

    public getModule(moduleName: string): IModule {
        return this.m_ModuleList.getValue(moduleName);
    }
}
