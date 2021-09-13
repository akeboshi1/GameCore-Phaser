import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { EventType, GameState, Size } from "structure";
import { Game } from "../game";
import { BasicMediator, UIType } from "./basic/basic.mediator";
import { UILayoutType, UIMediatorType } from "./ui.mediator.type";
export class UIManager extends PacketHandler {
    protected mMedMap: Map<UIMediatorType, BasicMediator>;
    protected mUIStateData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI;
    protected isshowMainui: boolean = false;

    // ==== about checkUIState
    protected mNoneUIMap: Map<string, any> = new Map();
    protected mSceneUIMap: Map<string, any> = new Map();
    protected mNormalUIMap: Map<string, any> = new Map();
    protected mPopUIMap: Map<string, any> = new Map();
    protected mTipUIMap: Map<string, any> = new Map();
    protected mMonopolyUIMap: Map<string, any> = new Map();
    protected mActivityUIMap: Map<string, any> = new Map();
    protected mUILayoutMap: Map<string, UILayoutType> = new Map();
    // 用于记录功能ui打开的顺序,最多2个
    protected mShowuiList: any[] = [];
    protected mLoadingCache: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI[] = [];
    protected mCloseCache: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI[] = [];
    protected mUpdateCache: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI[] = [];

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
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_SHOW_CREATE_ROLE_UI, this.onHandleShowCreateRoleUI);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_CLOSE_CREATE_ROLE_UI, this.onHandleCloseCreateRoleUI);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI, this.onUIStateHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_FORCE_OFFLINE, this.onForceOfflineHandler);
        this.game.emitter.on(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
        this.game.emitter.on(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
        this.game.emitter.on("EnterRoom", this.roomCreated, this);
    }

    public removePackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
        this.game.emitter.off(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
        this.game.emitter.off(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
        this.game.emitter.on("EnterRoom", this.roomCreated, this);
    }

    public showMainUI(hideNames?: string[]) {
        if (this.mUIStateData) {
            this.updateUIState(this.mUIStateData);
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

    // public showDecorateUI() {
    //     this.mMedMap.forEach((mediator: any) => {
    //         if (mediator.isSceneUI() && !mediator.isShow()) {
    //             mediator.show();
    //         }
    //     });
    // }

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
                // todo 处理引导
                this.game.peer.render.showPanel(type, param);
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type, mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        if (mediator.isShow()) return;
        mediator.uiState = 1;
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
        if (!mediator.isShow()) {
            mediator.uiState = 0;
            return;
        };
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

    public getUIStateData(name: string): any[] {
        if (!this.mUIStateData) return null;
        const arr: op_pkt_def.IPKT_UI[] = [];
        for (const data of this.mUIStateData.ui) {
            const tagName = data.name.split(".")[0];
            const paneName = this.getPanelNameByAlias(tagName);
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

    /**
     * 根据面板Key更新UI状态
     * @param panel Panel key
     */
    public refrehActiveUIState(panel: string) {
        const states = this.getUIStateData(panel);
        if (!states) return;
        for (const state of states) {
            this.updateUI(state);
        }
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
        if (this.mUIStateData) this.mUIStateData = undefined;
        this.isshowMainui = false;
    }

    protected async onForceOfflineHandler(packet: PBpacket) {

        if (this.game.peer.state.key === GameState.ChangeGame) return;
        this.game.gameStateManager.startState(GameState.OffLine);
        this.game.peer.render.showAlert("common.offline", true).then(() => {
            this.game.peer.render.hidden();
        });
    }

    protected updateUIState(data: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI) {
        for (const ui of data.ui) {
            this.updateUI(ui);
        }
    }

    protected updateUI(ui: op_pkt_def.IPKT_UI) {
        const tag = ui.name;
        const paneltags = tag.split(".");
        const panelName = this.getPanelNameByAlias(paneltags[0]);
        if (panelName) {
            const mediator: BasicMediator = this.mMedMap.get(panelName);
            if (mediator) {
                if (paneltags.length === 1) {
                    if (ui.visible || ui.visible === undefined) {
                        if (mediator.isSceneUI()) this.showMed(panelName);
                    } else {
                        this.hideMed(panelName);
                    }
                } else {
                    this.game.peer.render.updateUIState(panelName, ui);
                }
            }
        }
    }

    protected getMediatorClass(type: string): any {
        const className = type + "Mediator";
        return require(`./${type}/${className}`);
    }

    protected handleShowUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        // Logger.getInstance().log("show ui =========>", "handleShowUI");
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom) {
            // Logger.getInstance().log("show ui =========>", "has currentRoom");
            this.showMed(ui.name, ui);
        } else {
            if (this.mLoadingCache.indexOf(ui) < 0) {
                this.mLoadingCache.push(ui);
            }
            // this.game.emitter.off("EnterRoom", this.roomCreated, this);
            // this.game.emitter.on("EnterRoom", this.roomCreated, this);
        }
    }

    protected handleCloseUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom) {
            this.hideMed(ui.name);
        } else {
            const idx = this.mLoadingCache.findIndex((x) => x.name === ui.name);
            if (idx >= 0) {
                this.mLoadingCache.splice(idx, 1);
            }
            const idx1 = this.mUpdateCache.findIndex((x) => x.name === ui.name);
            if (idx1 >= 0) {
                this.mUpdateCache.splice(idx1, 1);
            }
            if (this.mCloseCache.indexOf(ui) < 0) {
                this.mCloseCache.push(ui);
            }
        }
    }

    protected handleUpdateUI(packet: PBpacket) {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom) {
            this.updateMed(ui.name, ui);
        } else {
            if (this.mUpdateCache.indexOf(ui) < 0) {
                this.mUpdateCache.push(ui);
            }
        }
    }

    protected roomCreated() {
        // Logger.getInstance().log("show ui =========>", "roomCreated");
        this.game.emitter.off("EnterRoom", this.roomCreated, this);
        for (const oneCache of this.mLoadingCache) {
            this.showMed(oneCache.name, oneCache);
        }
        this.mLoadingCache.length = 0;
        for (const updateCache of this.mUpdateCache) {
            this.updateMed(updateCache.name, updateCache);
        }
        this.mUpdateCache.length = 0;
        for (const hideCache of this.mCloseCache) {
            this.hideMed(hideCache.name);
        }
        this.mCloseCache.length = 0;
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

    protected onOpenUIMediator() {
        if (arguments) {
            const uiName = arguments[0];
            const data = arguments[1];
            this.showMed(uiName, data);
        }

    }

    protected initUILayoutType() {
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
}
