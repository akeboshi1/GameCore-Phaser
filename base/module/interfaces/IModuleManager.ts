import {IModule} from "./IModule";
import {IModuleInfo} from "./IModuleInfo";
import {IPhaserLoadList} from "../../../interface/IPhaserLoadList";

export interface IModuleManager {
    getModule( moduleType: string ): IModule;

    /**创建模块**/
    openModule( moduleName: string, loadList?: IPhaserLoadList, param?: any);

    /**销毁模块**/
    destroyModule( moduleName: string);
}