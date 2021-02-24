import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_pkt_def} from "pixelpai_proto";
import {EventType, ModuleName} from "structure";
import {i18n, Size} from "utils";
import {Game} from "../game";
import {BasicMediator, UIType} from "./basic/basic.mediator";
import {UILayoutType, UIMediatorType} from "./ui.mediator.type";

export class UIManager extends PacketHandler {
    protected mMedMap: Map<UIMediatorType, BasicMediator>;
    protected mAtiveUIData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI;
    protected isshowMainui: boolean = false;

    // ==== about checkUIState
    private mNoneUIMap: Map<string, any> = new Map();
    private mSceneUIMap: Map<string, any> = new Map();
    private mNormalUIMap: Map<string, any> = new Map();
    private mPopUIMap: Map<string, any> = new Map();
    private mTipUIMap: Map<string, any> = new Map();
    private mMonopolyUIMap: Map<string, any> = new Map();
    private mActivityUIMap: Map<string, any> = new Map();
    private mUILayoutMap: Map<string, UILayoutType> = new Map();
    // 用于记录功能ui打开的顺序,最多2个
    private mShowuiList: any[] = [];
    private mLoadingCache: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI[] = [];

    constructor(protected game: Game) {
        super();
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        this.initUILayoutType();
    }

    public getMed(name: string): BasicMediator {
        return this.mMedMap.get(name);
    }

    public recover() {
        this.mMedMap.forEach((mediator: any) => {
            if (mediator && mediator.isShow()) {
                mediator.hide();
            }
        });
    }

    public addPackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        // TODO 这2条协议合并到SHOW_UI和CLOS_UI
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI, this.onHandleShowCreateRoleUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_SHOW_CREATE_ROLE_UI, this.onHandleShowCreateRoleUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_CLOSE_CREATE_ROLE_UI, this.onHandleCloseCreateRoleUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI, this.onUIStateHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_FORCE_OFFLINE, this.onForceOfflineHandler);
        this.game.emitter.on(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
        this.game.emitter.on(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
    }

    public removePackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
        this.game.emitter.off(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
    }

    public showMainUI(hideNames?: string[]) {
        if (this.mAtiveUIData) {
            this.updateUIState(this.mAtiveUIData);
        }
        this.mMedMap.forEach((mediator: any) => {
            if (mediator.isSceneUI() && !mediator.isShow()) {
                if (!hideNames || hideNames.indexOf(mediator.key) === -1)
                    mediator.show();
            }
        });
        for (const oneCache of this.mLoadingCache) {
            this.showMed(oneCache.name, oneCache);
        }
        this.mLoadingCache.length = 0;
        this.isshowMainui = true;
    }

    public showDecorateUI() {
        this.mMedMap.forEach((mediator: any) => {
            if (mediator.isSceneUI() && !mediator.isShow()) {
                mediator.show();
            }
        });
    }

    public showMed(type: string, param?: any) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + "Mediator";
        let mediator: BasicMediator = this.mMedMap.get(type);
        if (!mediator) {
            // const path: string = `./${type}/${type}Mediator`;
            const ns: any = require(`./${type}/${className}`);
            mediator = new ns[className](this.game);
            if (!mediator) {
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type, mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        if (mediator.isShow()) return;
        mediator.show(param);
    }

    public updateMed(type: string, param?: any) {
        if (!this.mMedMap) {
            return;
        }
        const name: string = `${type}`;
        const mediator: BasicMediator = this.mMedMap.get(name);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (param) mediator.setParam(param);
        mediator.update(param);
    }

    public hideMed(type: string) {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const medName: string = `${type}`;
        const mediator: BasicMediator = this.mMedMap.get(medName);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (!mediator.isShow()) return;
        mediator.hide();
    }

    public showExistMed(type: string, extendName = "") {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + extendName;
        const mediator: BasicMediator = this.mMedMap.get(type);
        if (mediator) mediator.show();
    }

    public getActiveUIData(name: string): any[] {
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

    public checkUIState(medName: string, show: boolean) {
        const mediator = this.mMedMap.get(medName);
        if (!mediator) return;
        const uiType: number = mediator.UIType;
        const deskBoo: boolean = this.game.peer.isPlatform_PC();
        let map: Map<string, any>;
        switch (uiType) {
            case UIType.None:
                map = this.mNoneUIMap;
                break;
            case UIType.Scene:
                map = this.mSceneUIMap;
                this.checkSceneUImap(show, medName);
                break;
            case UIType.Normal:
                map = this.mNormalUIMap;
                // pc端场景ui无需收进，但是功能ui可以共存，需要调整位置
                if (deskBoo) {
                    this.checkNormalUITween(show, medName);
                } else {
                    this.checkBaseUImap(show);
                }
                break;
            case UIType.Monopoly:
                map = this.mMonopolyUIMap;
                this.checkBaseUImap(show);
                this.checkNormalUImap(show);
                this.chekcTipUImap(show);
                break;
            case UIType.Tips:
                map = this.mTipUIMap;
                break;
            case UIType.Pop:
                map = this.mPopUIMap;
                break;
            case UIType.Activity:
                map = this.mActivityUIMap;
                break;
        }
        if (map) map.set(medName, mediator);
    }

    public destroy() {
        this.removePackListener();
        if (this.mMedMap) {
            this.mMedMap.forEach((basicMed: BasicMediator) => {
                if (basicMed) {
                    basicMed.destroy();
                    basicMed = null;
                }
            });
            this.mMedMap.clear();
            this.mMedMap = null;
        }
        if (this.mAtiveUIData) this.mAtiveUIData = undefined;
        this.isshowMainui = false;
    }

    protected onForceOfflineHandler(packet: PBpacket) {
        this.game.peer.render.showAlert(i18n.t("common.offline"), true);
    }

    protected updateUIState(data: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI) {
        for (const ui of data.ui) {
            const tag = ui.name;
            const paneltags = tag.split(".");
            const panelName = this.getPanelNameByStateTag(paneltags[0]);
            if (panelName) {
                const mediator: BasicMediator = this.mMedMap.get(panelName);
                if (mediator) {
                    if (paneltags.length === 1) {
                        if (ui.visible || ui.visible === undefined) {
                            this.showMed(panelName);
                        } else {
                            this.hideMed(panelName);
                        }
                    } else {
                        this.game.peer.render.updateUIState(panelName, ui);
                    }
                }
            }
        }
    }

    protected getMediatorClass(type: string): any {
        const className = type + "Mediator";
        return require(`./${type}/${className}`);
    }

    protected onUIStateHandler(packge: PBpacket) {
        this.mAtiveUIData = packge.content;
        if (this.mAtiveUIData && this.mMedMap) {
            this.updateUIState(this.mAtiveUIData);
        }
    }

    protected getPanelNameByStateTag(tag: string) {
        switch (tag) {
            case "mainui":
                return "PicaMainUI";
            case "activity":
                return "Activity";
            case "picachat":
                return "PicaChat";
            case "picanavigate":
                return "PicaNavigate";
            case "PicaHandheld":
                return "PicaHandheld";
        }
        return tag;
    }

    protected handleShowUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
            this.showMed(ui.name, ui);
        } else {
            this.mLoadingCache.push(ui);
        }
    }

    protected handleUpdateUI(packet: PBpacket) {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
            this.updateMed(ui.name, ui);
        }
    }

    protected handleCloseUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
            this.hideMed(ui.name);
        } else {
            const idx = this.mLoadingCache.findIndex((x) => x.name === ui.name);
            if (idx >= 0) {
                this.mLoadingCache.splice(idx, 1);
            }
        }
    }

    protected onHandleShowCreateRoleUI(packet: PBpacket) {
        //  this.showMed(ModuleName.CREATEROLE_NAME, packet.content);
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_SHOW_CREATE_ROLE_UI = packet.content;
        this.showMed(ModuleName.PICACREATEROLE_NAME, content);
    }

    protected onHandleCloseCreateRoleUI() {
        this.hideMed(ModuleName.PICACREATEROLE_NAME);
        // this.game.peer.render.hideCreateRole();
    }

    protected getPanelNameByAlias(alias: string) {
        switch (alias) {
            case "MessageBox":
                return "PicaMessageBox";
        }
        return alias;
    }

    protected clearMediator() {
        this.mMedMap.forEach((mediator) => mediator.destroy());
        this.mMedMap.clear();
        this.isshowMainui = false;
    }

    private onOpenUIMediator() {
        if (arguments) {
            const uiName = arguments[0];
            const data = arguments[1];
            this.showMed(uiName, data);
        }

    }
    // ==== about checkUIState
    private checkSceneUImap(show: boolean, medName: string) {
        const layoutType = this.mUILayoutMap.get(medName);
        if (layoutType === undefined || layoutType === UILayoutType.None) return;
        if (!show) {
            this.mSceneUIMap.forEach((med: any) => {
                const className = med.constructor.name;
                const tempType = this.mUILayoutMap.get(className);
                if (tempType === layoutType && className !== medName && med.isShow() === true) med.hide();
            });
        }
    }
    private checkNormalUITween(show: boolean, medName: string) {
        const size: Size = this.game.getSize();
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
                    if (med.isShow()) med.hide();
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
    private checkBaseUImap(show: boolean) {
        this.mSceneUIMap.forEach((med) => {
            if (med) med.tweenExpand(show);
        });
    }
    private checkNormalUImap(show: boolean) {
        this.mNormalUIMap.forEach((med) => {
            if (med) {
                if (show) {
                    // med.show();
                } else {
                    if (med.isShow()) med.hide();
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
                    if (med.isShow()) med.hide();
                }
            }
        });
        if (!show) this.mNormalUIMap.clear();
    }
    private initUILayoutType() {
        this.mUILayoutMap.set(ModuleName.PICACHAT_NAME, UILayoutType.Bottom);
        this.mUILayoutMap.set(ModuleName.PICANAVIGATE_NAME, UILayoutType.Bottom);
        this.mUILayoutMap.set(ModuleName.PICAWORK_NAME, UILayoutType.Bottom);
        this.mUILayoutMap.set(ModuleName.PICANEWROLE_NAME, UILayoutType.Bottom);
    }
}
