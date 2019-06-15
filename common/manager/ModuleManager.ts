import {IModuleManager} from "../../base/module/interfaces/IModuleManager";
import BaseSingleton from "../../base/BaseSingleton";
import {IModule} from "../../base/module/interfaces/IModule";
import {IModuleInfo} from "../../base/module/interfaces/IModuleInfo";
import {HashMap} from "../../base/ds/HashMap";
import Globals from "../../Globals";
import {
    IAtlasResource, IImageResource,
    INineSliceImageResource,
    IPhaserLoadList,
    ISheetResource
} from "../../interface/IPhaserLoadList";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import {UI} from "../../Assets";


export class ModuleManager extends BaseSingleton implements IModuleManager {
    protected m_ModuleList: HashMap;
    private CLASS_NAME_SUFFIX = "Module";

    constructor() {
        super();
        this.m_ModuleList = new HashMap();
    }

    public openModule(moduleName: string, ...param: any[]): void {
        let loadList: IPhaserLoadList = {};
        let nineSliceImageResource: INineSliceImageResource[];
        let sheetResource: ISheetResource[];
        let atlasResource: IAtlasResource[];
        let imageResource: IImageResource[];
        switch (moduleName) {
            case ModuleTypeEnum.CHAT:
                nineSliceImageResource = [{
                    key: UI.Background.getName(),
                    png: UI.Background.getPNG(),
                    top: 4,
                    left: 4,
                    right: 4,
                    bottom: 4
                },
                    {key: UI.InputBg.getName(), png: UI.InputBg.getPNG(), top: 4, left: 4, right: 4, bottom: 4}
                ];
                sheetResource = [{
                    key: UI.DropDownBtn.getName(),
                    png: UI.DropDownBtn.getPNG(),
                    frameWidth: UI.DropDownBtn.getWidth(),
                    frameHeight: UI.DropDownBtn.getHeight()
                    },
                    {
                        key: UI.LabaBt.getName(),
                        png: UI.LabaBt.getPNG(),
                        frameWidth: UI.LabaBt.getWidth(),
                        frameHeight: UI.LabaBt.getHeight()
                    },
                    {
                        key: UI.VoiceBt.getName(),
                        png: UI.VoiceBt.getPNG(),
                        frameWidth: UI.VoiceBt.getWidth(),
                        frameHeight: UI.VoiceBt.getHeight()
                    }
                ];
                atlasResource = [{
                    key: UI.Button.getName(),
                    png: UI.Button.getPNG(),
                    json: UI.Button.getJSON()
                },
                {
                    key: UI.ButtonChat.getName(),
                    png: UI.ButtonChat.getPNG(),
                    json: UI.ButtonChat.getJSON()
                }];
                imageResource = [
                    {key: UI.ArrowDown.getName(), png: UI.ArrowDown.getPNG()}
                ];
                break;
            case ModuleTypeEnum.ROLEINFO:
                nineSliceImageResource = [{
                    key: UI.ProgressBg.getName(),
                    png: UI.ProgressBg.getPNG(),
                    top: 6,
                    left: 6,
                    right: 6,
                    bottom: 6
                },
                    {key: UI.ProgressFill.getName(), png: UI.ProgressFill.getPNG(), top: 6, left: 6, right: 6, bottom: 6},
                    {key: UI.ChatBubble.getName(), png: UI.ChatBubble.getPNG(), top: 9, left: 9, right: 9, bottom: 9}
                ];
                sheetResource = [{
                    key: UI.VoiceIcon.getName(),
                    png: UI.VoiceIcon.getPNG(),
                    frameWidth: UI.VoiceIcon.getWidth(),
                    frameHeight: UI.VoiceIcon.getHeight()
                }];
                break;
            case ModuleTypeEnum.SHORTCUTMENU:
                imageResource = [{
                    key: UI.ShortcutItemBg.getName(),
                    png: UI.ShortcutItemBg.getPNG()
                }, {
                    key: UI.ShortcutItemIcon.getName(),
                    png: UI.ShortcutItemIcon.getPNG()
                }, {
                    key: UI.MenuItemBg.getName(),
                    png: UI.MenuItemBg.getPNG()
                }, {
                    key: UI.MenuItemOver.getName(),
                    png: UI.MenuItemOver.getPNG()
                }, {
                    key: UI.MenuBtBag.getName(),
                    png: UI.MenuBtBag.getPNG()
                }];
                break;
            case ModuleTypeEnum.PROMPT:
                nineSliceImageResource = [{
                    key: UI.WindowBg.getName(),
                    png: UI.WindowBg.getPNG(),
                    top: 29,
                    left: 13,
                    right: 13,
                    bottom: 7
                }];
                sheetResource = [{
                    key: UI.WindowClose.getName(),
                    png: UI.WindowClose.getPNG(),
                    frameWidth: UI.WindowClose.getWidth(),
                    frameHeight: UI.WindowClose.getHeight()
                }];
                break;
            case ModuleTypeEnum.BAG:
                nineSliceImageResource = [{
                    key: UI.BagBg.getName(),
                    png: UI.BagBg.getPNG(),
                    top: 29,
                    left: 13,
                    right: 13,
                    bottom: 7
                }];
                imageResource = [{
                    key: UI.BagItemBg.getName(),
                    png: UI.BagItemBg.getPNG()
                }, {
                    key: UI.BagBg.getName(),
                    png: UI.BagBg.getPNG()
                }, {
                    key: UI.BagTitle.getName(),
                    png: UI.BagTitle.getPNG()
                }, {
                    key: UI.PageBt.getName(),
                    png: UI.PageBt.getPNG()
                }];
                sheetResource = [{
                    key: UI.PageBt.getName(),
                    png: UI.PageBt.getPNG(),
                    frameWidth: UI.PageBt.getWidth(),
                    frameHeight: UI.PageBt.getHeight()
                }];
                break;
            case ModuleTypeEnum.STORAGE:
                nineSliceImageResource = [{
                    key: UI.BagBg.getName(),
                    png: UI.BagBg.getPNG(),
                    top: 29,
                    left: 13,
                    right: 13,
                    bottom: 7
                }];
                imageResource = [{
                    key: UI.BagItemBg.getName(),
                    png: UI.BagItemBg.getPNG()
                }, {
                    key: UI.StorageTitle.getName(),
                    png: UI.StorageTitle.getPNG()
                }];
                break;
            case ModuleTypeEnum.CONTROLF:
                nineSliceImageResource = [{
                    key: UI.BagBg.getName(),
                    png: UI.BagBg.getPNG(),
                    top: 29,
                    left: 13,
                    right: 13,
                    bottom: 7
                }];
                atlasResource = [{
                    key: UI.Button.getName(),
                    png: UI.Button.getPNG(),
                    json: UI.Button.getJSON()
                }];
                break;
            case ModuleTypeEnum.ITEMDETAIL:
                atlasResource = [{
                    key: UI.ButtonBlue.getName(),
                    png: UI.ButtonBlue.getPNG(),
                    json: UI.ButtonBlue.getJSON()
                }];
                break;
            case ModuleTypeEnum.VOTE:
                imageResource = [{
                    key: UI.VoteFlag.getName(),
                    png: UI.VoteFlag.getPNG()
                }, {
                    key: UI.VoteLight.getName(),
                    png: UI.VoteLight.getPNG()
                }];
                atlasResource = [{
                    key: UI.ButtonRed.getName(),
                    png: UI.ButtonRed.getPNG(),
                    json: UI.ButtonRed.getJSON()
                }];
                break;
            case ModuleTypeEnum.VOTERESULT:
                imageResource = [{
                    key: UI.KillerFlag.getName(),
                    png: UI.KillerFlag.getPNG()
                }, {
                    key: UI.VoteLight.getName(),
                    png: UI.VoteLight.getPNG()
                }];
                break;
            case ModuleTypeEnum.NOTICE:
                    nineSliceImageResource = [{
                        key: UI.Background.getName(),
                        png: UI.Background.getPNG(),
                        top: 4,
                        left: 4,
                        right: 4,
                        bottom: 4
                    },
                        {key: UI.InputBg.getName(), png: UI.InputBg.getPNG(), top: 4, left: 4, right: 4, bottom: 4}
                    ];
                break;
        }

        if (nineSliceImageResource) {
            loadList.nineslices = nineSliceImageResource;
        }
        if (sheetResource) {
            loadList.sheets = sheetResource;
        }
        if (atlasResource) {
            loadList.atlas = atlasResource;
        }
        if (imageResource) {
            loadList.images = imageResource;
        }

        let module: IModuleInfo = {
            name: moduleName,
            data: param,
            loadList: loadList
        };
        this.createModule(module);
    }

    public closeModule(moduleName: string): void {
        let module: IModule = this.getModule(moduleName);
        if (module) {
            module.stop();
        }
    }

    public destroyModule(moduleName: string): void {
        let module: IModule = this.m_ModuleList.remove(moduleName);
        if (module) {
            module.stop();
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
        super.dispose();
    }

    private createModule(info: IModuleInfo): void {
        if (null == info) return;
        let moduleName: string = info.name;
        let module: IModule = this.getModule(moduleName);
        if (module) {
            module.setParam(info.data);
            module.recover();
        } else {
            if (info.loadList === undefined) {
                module = this.linkModule(info);
                module.startUp();
            } else {
                this.loadModule(info, () => {
                    module = this.getModule(moduleName);
                    if (module) {
                        module.setParam(info.data);
                        module.recover();
                    } else {
                        module = this.linkModule(info);
                        module.startUp();
                    }
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
                Globals.game.load.image(info.loadList.images[i].key, info.loadList.images[i].png);
                ++loadNum;
            }
        }

        i = 0;
        len = info.loadList.sheets ? info.loadList.sheets.length : 0;
        for (; i < len; i++) {
            if (!Globals.game.cache.checkTextureKey(info.loadList.sheets[i].key)) {
                Globals.game.load.spritesheet(info.loadList.sheets[i].key, info.loadList.sheets[i].png, info.loadList.sheets[i].frameWidth, info.loadList.sheets[i].frameHeight);
                ++loadNum;
            }
        }

        i = 0;
        len = info.loadList.nineslices ? info.loadList.nineslices.length : 0;
        for (; i < len; i++) {
            if (Globals.game.cache.getNineSlice(info.loadList.nineslices[i].key) === undefined) {
                Globals.game.load.nineSlice(info.loadList.nineslices[i].key, info.loadList.nineslices[i].png,
                    info.loadList.nineslices[i].top, info.loadList.nineslices[i].left, info.loadList.nineslices[i].right,
                    info.loadList.nineslices[i].bottom);
                ++loadNum;
            }
        }

        i = 0;
        len = info.loadList.atlas ? info.loadList.atlas.length : 0;
        for (; i < len; i++) {
            if (!Globals.game.cache.checkImageKey(info.loadList.atlas[i].key)) {
                Globals.game.load.atlas(info.loadList.atlas[i].key, info.loadList.atlas[i].png, info.loadList.atlas[i].json);
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

        Globals.game.load.onLoadComplete.addOnce(() => {
            if (callBack != null) {
                let cb: Function = callBack;
                callBack = null;
                cb.apply(thisObj);
                thisObj = null;
            }
        }, this);
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
