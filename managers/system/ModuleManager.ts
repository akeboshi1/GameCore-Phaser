import {IModuleManager} from "../../base/module/interfaces/IModuleManager";
import BaseSingleton from "../../base/BaseSingleton";
import {IModule} from "../../base/module/interfaces/IModule";
import {IModuleInfo} from "../../base/module/interfaces/IModuleInfo";
import {HashMap} from "../../modules/scene/util/HashMap";

export class ModuleManager extends BaseSingleton implements IModuleManager {
    private CLASS_NAME_SUFFIX: string = "Module";
    protected m_ModuleList: HashMap;

    constructor() {
        super();
        this.m_ModuleList = new HashMap();
    }

    public createModule(info: IModuleInfo, callBack?: Function) {
        if (null == info) return;
        let moduleName: string = info.name;
        let module: IModule = this.getModule(moduleName);
        if (module) {
            module.recover();
        } else {
            let className: string = info.name + this.CLASS_NAME_SUFFIX;
            let ns: any = require("../../modules/scene/" + className + ".ts");
            module = new ns[className]();
            module.setParam(info.data);
            module.name = info.name;
            this.m_ModuleList.add(info.data, module);
            module.startUp();
        }
    }

    public destroyModule(moduleName: string) {
        let module: IModule = this.m_ModuleList.remove(moduleName);
        if ( module ) {
            module.onDispose();
        }
    }

    public getModule(moduleName: string): IModule {
        return this.m_ModuleList.getValue(moduleName);
    }
}