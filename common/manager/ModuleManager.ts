import {IModuleManager} from "../../base/module/interfaces/IModuleManager";
import BaseSingleton from "../../base/BaseSingleton";
import {IModule} from "../../base/module/interfaces/IModule";
import {IModuleInfo} from "../../base/module/interfaces/IModuleInfo";
import {HashMap} from "../../base/ds/HashMap";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import {IModuleLoadList} from "../../base/module/interfaces/IModuleLoadList";
import Globals from "../../Globals";
import {Sound} from "../../Assets";


export class ModuleManager extends BaseSingleton implements IModuleManager {
    private CLASS_NAME_SUFFIX = "Module";
    protected m_ModuleList: HashMap;

    constructor() {
        super();
        this.m_ModuleList = new HashMap();
    }

    public openModule( moduleName: string, param?: any, loadList?: IModuleLoadList ): void {
        let module: IModuleInfo = {
            name: moduleName,
            data: param,
            loadList: loadList
        };
        this.createModule( module );
    }

    private createModule(info: IModuleInfo): void {
        if (null == info) return;
        let moduleName: string = info.name;
        let module: IModule = this.getModule(moduleName);
        if (module) {
            module.recover();
        } else {
            if (info.loadList === undefined) {
                module = this.linkModule(info);
                module.startUp();
            } else {
                this.loadModule(info , () => {
                    module = this.linkModule(info);
                    module.startUp();
                }, this);
            }
        }
    }

    private loadModule(info: IModuleInfo, callBack?: Function, thisObj?: any): void {
        let loadNum = 0;
        let i = 0;
        let len = info.loadList.images ? info.loadList.images.length : 0;
        for (; i < len; i++) {
            if (!Globals.game.cache.checkImageKey(info.loadList.images[i].key)) {
                Globals.game.load.image(info.loadList.images[i].key, info.loadList.images[i].url);
                ++loadNum;
            }
        }
        i = 0;
        len = info.loadList.nineslice_images ? info.loadList.nineslice_images.length : 0;
        for (; i < len; i++) {
            if (Globals.game.cache.getNineSlice(info.loadList.nineslice_images[i].key) === undefined) {
                Globals.game.load.nineSlice(info.loadList.nineslice_images[i].key, info.loadList.nineslice_images[i].url,
                    info.loadList.nineslice_images[i].top, info.loadList.nineslice_images[i].left, info.loadList.nineslice_images[i].right,
                    info.loadList.nineslice_images[i].bottom );
                ++loadNum;
            }
        }

        if (loadNum === 0) {
            if (callBack != null) {
                let cb: Function = callBack;
                callBack = null;
                cb.apply(thisObj);
                thisObj = null;
            }
            return;
        }

        Globals.game.load.onLoadComplete.addOnce(callBack, thisObj);
        Globals.game.load.start();
    }

    private linkModule(info: IModuleInfo): IModule {
        let className: string = info.name + this.CLASS_NAME_SUFFIX;
        let ns: any = require("../../modules/" + info.name + "/" + className + ".ts");
        let module: IModule = new ns[className]();
        module.setParam(info.data);
        module.name = info.name;
        this.m_ModuleList.add(info.name, module);
        return module;
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

    public dispose(): void {
      let len: number = this.m_ModuleList.valueList.length;
      let module: IModule;
      for (let i = 0; i < len; i++) {
        module = this.m_ModuleList.valueList[i];
        module.onDispose();
      }
      this.m_ModuleList.clear();
    }
}
