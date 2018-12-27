import {IModuleManager} from "../../base/module/interfaces/IModuleManager";
import BaseSingleton from "../../base/BaseSingleton";
import {IModule} from "../../base/module/interfaces/IModule";
import {IModuleInfo} from "../../base/module/interfaces/IModuleInfo";
import {HashMap} from "../../base/ds/HashMap";
import Globals from "../../Globals";
import {IPhaserLoadList} from "../../interface/IPhaserLoadList";


export class ModuleManager extends BaseSingleton implements IModuleManager {
    protected m_ModuleList: HashMap;
    private CLASS_NAME_SUFFIX = "Module";

    constructor() {
        super();
        this.m_ModuleList = new HashMap();
    }

    public openModule(moduleName: string, param?: any, loadList?: IPhaserLoadList): void {
        let module: IModuleInfo = {
            name: moduleName,
            data: param,
            loadList: loadList
        };
        this.createModule(module);
    }

    public destroyModule(moduleName: string): void {
        let module: IModule = this.m_ModuleList.remove(moduleName);
        if (module) {
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
                this.loadModule(info, () => {
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
            if (!Globals.game.cache.checkImageKey(info.loadList.images[i].png)) {
                Globals.game.load.image(info.loadList.images[i].key, info.loadList.images[i].png);
                ++loadNum;
            }
        }

        i = 0;
        len = info.loadList.nineslices ? info.loadList.nineslices.length : 0;
        for (; i < len; i++) {
            if (Globals.game.cache.getNineSlice(info.loadList.nineslices[i].png) === undefined) {
                Globals.game.load.nineSlice(info.loadList.nineslices[i].key, info.loadList.nineslices[i].png,
                    info.loadList.nineslices[i].top, info.loadList.nineslices[i].left, info.loadList.nineslices[i].right,
                    info.loadList.nineslices[i].bottom);
                ++loadNum;
            }
        }

        i = 0;
        len = info.loadList.atlas ? info.loadList.atlas.length : 0;
        for (; i < len; i++) {
            Globals.game.load.atlas(info.loadList.atlas[i].key, info.loadList.atlas[i].png, info.loadList.atlas[i].json);
            ++loadNum;
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
}
