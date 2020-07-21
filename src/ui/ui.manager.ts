import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ChatMediator } from "./chat/chat.mediator";
import { ILayerManager, LayerManager } from "./layer.manager";
import { BagMediator } from "./bag/bagView/bagMediator";
import { Size } from "../utils";
import { UIMediatorType } from "./ui.mediatorType";
import { InputTextFactory } from "./components/inputTextFactory";
import { InteractiveBubbleMediator } from "./Bubble/InteractiveBubbleMediator";
import { MessageType } from "../const/MessageType";
import { BagGroupMediator } from "../ui/baseView/bagGroup/bag.group.mediator";
import { WorldService } from "../game";
import { BaseMediator } from "../ui/components";
import { BasePanel } from "../ui/components/BasePanel";
// import { UIType } from "../../lib/rexui/lib/ui/interface/baseUI/UIType";
// import { ReAwardTipsMediator } from "./ReAwardTips/ReAwardTipsMediator";

// export const enum UIType {
//     NoneUIType,
// Scene, // 场景内常驻ui
// Normal, // 普通功能ui
// Pop, // 弹出型ui
// Tips, // tips型ui
// Monopoly, // 独占型ui
// Activity, // 热发布活动类型ui，便于单独刷新活动ui
// }
export class UiManager extends PacketHandler {
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    private mMedMap: Map<UIMediatorType, any>;
    private mUILayerManager: ILayerManager;
    private mCache: any[] = [];
    private mModuleCache: any[] = [];
    private mModuleLoad: boolean = false;
    private mNoneUIMap: Map<string, any> = new Map();
    private mSceneUIMap: Map<string, any> = new Map();
    private mNormalUIMap: Map<string, any> = new Map();
    private mPopUIMap: Map<string, any> = new Map();
    private mTipUIMap: Map<string, any> = new Map();
    private mMonopolyUIMap: Map<string, any> = new Map();
    private mActivityUIMap: Map<string, any> = new Map();
    private mCacheUI: Function;
    // 用于记录功能ui打开的顺序,最多2个
    private mShowuiList: any[] = [];
    private interBubbleMgr: any;
    private mInputTextFactory: InputTextFactory;
    private mAtiveUIData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI;
    private mStackList: any[] = [];// 记录面板打开关闭先后顺序
    private isShowMainUI: boolean = false;
    constructor(private worldService: WorldService) {
        super();
        this.worldService = worldService;
        this.mConnect = worldService.connection;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_MARKET, this.onEnableMarket);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditMode);
        this.mUILayerManager = new LayerManager();
        this.mInputTextFactory = new InputTextFactory(worldService);
        // this.interBubbleMgr = new InteractiveBubbleMediator(this.mUILayerManager, this.worldService);
        this.worldService.emitter.on("MODULE_INIT", this.showModuleUI, this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI, this.onUIStateHandler);
        this.mUILayerManager = new LayerManager();
        this.mInputTextFactory = new InputTextFactory(worldService);
    }

    public getInputTextFactory(): InputTextFactory {
        return this.mInputTextFactory;
    }

    public addPackListener() {
        if (this.mConnect) {
            this.mConnect.addPacketListener(this);
            this.worldService.emitter.on(MessageType.SHOW_UI, this.handleShowUI, this);
        }
    }

    public removePackListener() {
        if (this.mConnect) {
            this.mConnect.removePacketListener(this);
            this.worldService.emitter.off(MessageType.SHOW_UI, this.handleShowUI, this);
        }
    }

    public getUILayerManager(): ILayerManager {
        return this.mUILayerManager;
    }

    public getActiveUIData(name: string): op_pkt_def.IPKT_UI[] {
        if (!this.mAtiveUIData) return null;
        const arr: op_pkt_def.IPKT_UI[] = [];
        for (const data of this.mAtiveUIData.ui) {
            const tagName = data.name.split(".")[0];
            const paneName = this.getPanelNameByStateTag(tagName);
            if (paneName === name) {
                arr.push(data);
            }
        }
        return arr;
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        this.mUILayerManager.setScene(scene);
        if (this.mCacheUI) {
            this.mCacheUI();
            this.mCacheUI = undefined;
        }
    }
    public getScene(): Phaser.Scene {
        return this.mScene;
    }
    // 方案二：独立出来给予外部模块调用game-core来创建mediator；方案一：在模块内部创建mediator，现利用方案一来实现，原因是防止多模块之间路径混乱，让这些创建事情在模块内部实现
    public createMediator(className: string, nsPath: string): BaseMediator {
        let mediator;
        // const path: string = `./${type}/${type}Mediator`;
        const ns: any = require(nsPath);
        mediator = new ns[className](this.mUILayerManager, this.mScene, this.worldService);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        this.mMedMap.set(className, mediator);
        return mediator;
    }

    public showMainUI() {
        if (!this.mScene) {
            this.mCacheUI = this.showMainUI;
            return;
        }
        const scene = this.mScene;
        if (!this.mMedMap) {
            this.mMedMap = new Map();
            // ============场景中固定显示ui
            if (this.worldService.game.device.os.desktop) {
                this.mMedMap.set(UIMediatorType.ChatMediator, new ChatMediator(this.worldService, scene));
                this.mMedMap.set(BagGroupMediator.NAME, new BagGroupMediator(this.worldService, scene));
                this.mMedMap.set(UIMediatorType.BagMediator, new BagMediator(this.mUILayerManager, this.worldService, scene));
            } else {
                // this.mMedMap.set(ActivityMediator.name, new ActivityMediator(this.mUILayerManager, scene, this.worldService));
                // this.mMedMap.set(PicaMainUIMediator.name, new PicaMainUIMediator(this.mUILayerManager, scene, this.worldService));
                // this.mMedMap.set(PicaChatMediator.name, new PicaChatMediator(this.mUILayerManager, scene, this.worldService));
                // this.mMedMap.set(PicaNavigateMediator.name, new PicaNavigateMediator(this.mUILayerManager, scene, this.worldService));
                // this.mMedMap.set(MineCarMediator.name, new MineCarMediator(this.mUILayerManager, scene, this.worldService));
            }
            // this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, scene, this.worldService));
            // this.mMedMap.set(FriendMediator.NAME, new FriendMediator(scene, this.worldService));
            // this.mMedMap.set(ReAwardTipsMediator.name, new ReAwardTipsMediator(scene, this.worldService));
            for (const tmp of this.mCache) {
                const ui = tmp[0];
                this.showMed(ui.name, ui);
            }
            this.mCache.length = 0;
        }
        // TOOD 通过统一的方法创建打开
        this.mMedMap.forEach((mediator: any, key: string) => {
            if (mediator.isSceneUI()) {
                mediator.show();
            }
        });
        if (this.mAtiveUIData) {
            this.updateUIState(this.mAtiveUIData);
        }
        if (this.mCache) {
            for (const tmp of this.mCache) {
                const ui = tmp[0];
                this.showMed(ui.name, ui);
            }
            this.mCache.length = 0;
        }
    }

    public showDecorateUI() {
        if (!this.mScene) {
            this.mCacheUI = this.showDecorateUI;
            return;
        }
        this.clearMediator();
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        // const topMenu = new TopMenuMediator(this.mScene, this.worldService);
        // this.mMedMap.set(ElementStorageMediator.NAME, new ElementStorageMediator(this.mUILayerManager, this.mScene, this.worldService));
        // this.mMedMap.set(DecorateControlMediator.NAME, new DecorateControlMediator(this.mUILayerManager, this.mScene, this.worldService));
        // this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, this.mScene, this.worldService));
        // this.mMedMap.set(TopMenuMediator.name, topMenu);
        // topMenu.addItem({
        //     key: "Turn_Btn_Top", name: "SaveDecorate", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
        //     iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        // });
        this.showAll();
    }

    public resize(width: number, height: number) {
        if (this.mMedMap) {
            // this.mMedMap.forEach((mediator: BaseMediator) => {
            //     if (mediator.isShow) mediator.resize();
            // });
        }
    }

    public setMediator(value: string, mediator: any) {
        this.mMedMap.set(value, mediator);
    }

    public getMediator(type: string): any | undefined {
        if (!this.mMedMap) return;
        return this.mMedMap.get(type);
    }

    public clearMediator() {
        if (!this.mMedMap) {
            return;
        }
        this.mMedMap.forEach((med: any) => med.destroy());
        this.mMedMap.clear();
        this.mMedMap = null;
    }

    public destroy() {
        this.worldService.emitter.off("MODULE_INIT", this.showModuleUI, this);
        this.removePackListener();
        this.clearMediator();
        this.mMedMap = undefined;
        this.clearCache();
        this.mScene = undefined;
    }

    public baseFaceResize() {
    }

    public baseFaceTween(show: boolean) {
    }

    public checkUIState(medName: string, show: boolean) {
    }

    public showMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            this.mCache.push(param);
            return;
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type;
        let mediator: BaseMediator = this.mMedMap.get(className);
        if (!mediator) {
            // const path: string = `./${type}/${type}Mediator`;
            let ns: any;
            try {
                ns = require(`./${type}/${className}`);
            } catch (error) {
                if (this.mModuleLoad) {
                    this.worldService.emitter.emit("SHOW_UI", [type, param]);
                } else {
                    this.mModuleCache.push(param);
                }
                return;
            }
            mediator = new ns[className](this.mUILayerManager, this.mScene, this.worldService);
            if (!mediator) {
                // 发送事件让加载的模块去监听是否存在对应的ui，如果存在则创建，不存在则不管
                this.worldService.emitter.emit("SHOW_UI", [type, param]);
                return;
            }
            this.mMedMap.set(type + "Mediator", mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        // if (className === "RankMediator") {
        //     if (!this.worldService.game.device.os.desktop) {
        //         const med: TopMediator = this.getMediator(TopMediator.NAME) as TopMediator;
        //         if (med) {
        //             if (!med.isShow()) {
        //                 med.preRefreshBtn(className);
        //             } else {
        //                 med.refreshBtn(className, true);
        //             }
        //         }
        //         return;
        //     }
        // }
        this.checkUIState(className, false);
        mediator.show(param);
        // this.mStackList.unshift(className);
        // if (this.mStackList.length > 2) this.mStackList.splice(this.mStackList.length - 1, 1);
    }
    // public hideMed(type: string) {
    //     if (!this.mMedMap) {
    //         return;
    //     }
    //     type = this.getPanelNameByAlias(type);
    //     const medName: string = `${type}Mediator`;
    //     const mediator: BaseMediator = this.mMedMap.get(medName);
    //     if (!mediator) {
    //         // Logger.getInstance().error(`error ${type} no panel can show!!!`);
    //         return;
    //     }
    //     this.checkUIState(medName, true);
    //     mediator.hide();
    // }
    public showExistMed(type: string, extendName = "Mediator") {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + extendName;
        const mediator: BaseMediator = this.mMedMap.get(className);
        if (mediator) mediator.show();
    }

    public showModuleUI() {
        this.mModuleLoad = true;
        for (const tmp of this.mModuleCache) {
            const ui = tmp[0];
            this.showMed(ui.name, ui);
        }
        this.mModuleCache.length = 0;
        this.mModuleCache = undefined;
    }

    public register(key: string, mediator: BaseMediator) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        this.mMedMap.set(key, mediator);
    }

    public unregister(key: string) {
        this.mMedMap.delete(key);
    }

    private handleShowUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        this.showMed(ui.name, ui);
    }

    private handleUpdateUI(packet: PBpacket) {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI = packet.content;
        this.updateMed(ui.name, ui);
    }

    private handleCloseUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        this.hideMed(ui.name);
    }

    private onEnableEditMode(packet: PBpacket) {
        // let topMenu: TopMenuMediator = <TopMenuMediator>this.mMedMap.get(TopMenuMediator.NAME);
        // if (!topMenu) {
        //     topMenu = new TopMenuMediator(this.mScene, this.worldService);
        //     this.mMedMap.set(TopMenuMediator.NAME, topMenu);
        // }
        // topMenu.addItem({
        //     key: "Turn_Btn_Top", name: "EnterDecorate", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
        //     iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        // });
    }

    private onEnableMarket() {
        if (!this.mMedMap) {
            return;
        }
        // let topMenu: TopMenuMediator = <TopMenuMediator>this.mMedMap.get(TopMenuMediator.NAME);
        // if (!topMenu) {
        //     topMenu = new TopMenuMediator(this.mScene, this.worldService);
        //     this.mMedMap.set(TopMenuMediator.NAME, topMenu);
        // }
        // topMenu.addItem({
        //     key: "Turn_Btn_Top", name: "Market", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
        //     iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        // });
    }

    private checkBaseUImap(show: boolean) {
        this.mSceneUIMap.forEach((med) => {
            if (med) med.tweenExpand(show);
        });
    }

    private checkNormalUITween(show: boolean, medName: string) {
        const size: Size = this.worldService.getSize();
        let len: number = this.mShowuiList.length;
        let tmpName: string;
        let med;
        if (!show) {
            if (this.mShowuiList.indexOf(medName) === -1) this.mShowuiList.push(medName);
            len = this.mShowuiList.length;
            const mPad: number = len > 1 ? size.width / 3 : 0;
            for (let i: number = 0; i < len; i++) {
                tmpName = this.mShowuiList[i];
                med = this.mMedMap.get(tmpName);
                if (len > 2 && i === 0) {
                    med.hide();
                } else {
                    med.resize((i * 2 - 1) * mPad, 0);
                }
            }
            if (len > 2) this.mShowuiList.shift();
        } else {
            let index: number;
            for (let i: number = 0; i < len; i++) {
                tmpName = this.mShowuiList[i];
                med = this.mMedMap.get(tmpName);
                if (tmpName === medName) {
                    index = i;
                    continue;
                }
                med.resize(0, 0);
            }
            this.mShowuiList.splice(index, 1);
        }
    }

    private checkNormalUImap(show: boolean) {
        this.mNormalUIMap.forEach((med) => {
            if (med) {
                if (show) {
                    // med.show();
                } else {
                    med.hide();
                }
            }
        });
        if (!show) this.mNormalUIMap.clear();
    }

    private chekcTipUImap(show: boolean) {
        this.mTipUIMap.forEach((med) => {
            if (med) {
                if (show) {
                    // med.show();
                } else {
                    med.hide();
                }
            }
        });
        if (!show) this.mNormalUIMap.clear();
    }

    private updateMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            return;
        }
        const name: string = `${type}Mediator`;
        const mediator: any = this.mMedMap.get(name);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (param) mediator.setParam(param);
        mediator.update(param);
    }

    private hideMed(type: string) {
        if (!this.mMedMap) {
            return;
        }
        if (type === "MessageBox") {
            type = "PicaMessageBox";
        }
        const medName: string = `${type}Mediator`;
        const mediator: any = this.mMedMap.get(medName);
        if (!mediator) {
            this.worldService.emitter.emit("HIDE_UI", type);
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        // if (!this.worldService.game.device.os.desktop && medName === "RankMediator") {
        //     const med: TopMediator = this.getMediator(TopMediator.NAME) as TopMediator;
        //     if (med) {
        //         if (!med.isShow()) {
        //             med.preRefreshBtn(medName);
        //         } else {
        //             med.refreshBtn(medName, true);
        //         }
        //     }
        // }
        // if (!mediator.isShow()) return;
        this.checkUIState(medName, true);
        mediator.hide();
    }

    private showAll() {
        if (!this.mMedMap) {
            return;
        }
        this.mMedMap.forEach((med: any) => {
            if (med.isSceneUI()) {
                med.show();
            }
        });
    }

    private clearCache() {
        this.mCacheUI = undefined;
        this.mCache = [];
    }

    private closeAll() {
        if (!this.mMedMap) {
            return;
        }
        this.mMedMap.forEach((med: any) => med.hide());
    }

    private onUIStateHandler(packge: PBpacket) {
        this.mAtiveUIData = packge.content;
        if (this.mAtiveUIData && this.mMedMap) {
            this.updateUIState(this.mAtiveUIData);
        }
    }

    private updateUIState(data: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI) {
        for (const ui of data.ui) {
            const tag = ui.name;
            const paneltags = tag.split(".");
            const panelName = this.getPanelNameByStateTag(paneltags[0]);
            if (panelName) {
                const mediator: BaseMediator = this.mMedMap.get(panelName + "Mediator");
                if (mediator) {
                    if (paneltags.length === 1) {
                        if (ui.visible || ui.visible === undefined) {
                            this.showMed(panelName);
                        } else {
                            this.hideMed(panelName);
                        }
                    } else {
                        const view = mediator.getView();
                        if (view)
                            (<BasePanel>view).updateUIState(ui);
                    }
                }
            }
        }
    }
    private getPanelNameByStateTag(tag: string) {
        switch (tag) {
            case "mainui":
                return "PicaMainUI";
            case "activity":
                return "Activity";
            case "picachat":
                return "PicaChat";
            case "picanavigate":
                return "PicaNavigate";
        }
        return null;
    }
    private getPanelNameByAlias(alias: string) {
        switch (alias) {
            case "MessageBox":
                return "PicaMessageBox";
        }
        return alias;
    }
}
