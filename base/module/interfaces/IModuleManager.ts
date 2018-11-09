import {IModule} from "./IModule";
import {IModuleInfo} from "./IModuleInfo";

export interface IModuleManager {
    getModule( moduleType: string ): IModule;

    /**创建模块**/
    createModule( info: IModuleInfo, callBack?: Function);

    /**销毁模块**/
    destroyModule( moduleName: string);
}