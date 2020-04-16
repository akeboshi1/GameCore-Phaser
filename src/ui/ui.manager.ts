import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { IMediator } from "./baseMediator";
import { UIMediatorType } from "./ui.mediatorType";
import { ChatMediator } from "./chat/chat.mediator";
import { ILayerManager, LayerManager } from "./layer.manager";
import { NoticeMediator } from "./Notice/NoticeMediator";
import { BagMediator } from "./bag/bagView/bagMediator";
import { FriendMediator } from "./friend/friend.mediator";
import { ElementStorageMediator } from "./ElementStorage/ElementStorageMediator";
import { RankMediator } from "./Rank/RankMediator";
import { Size } from "../utils/size";
import { RightMediator } from "./baseView/rightGroup/right.mediator";
import { LeftMediator } from "./baseView/leftGroup/left.mediator";
import { BottomMediator } from "./baseView/bottomGroup/bottom.mediator";
import { BagGroupMediator } from "./baseView/bagGroup/bag.group.mediator";
import { TopMenuMediator } from "./baseView/top.menu/top.menu.mediator";
import { MessageType } from "../const/MessageType";
import { InputTextFactory } from "./components/inputTextFactory";
import { DecorateControlMediator } from "./DecorateControl/DecorateControlMediator";
import { PicaMainUIMediator } from "./PiCaMainUI/PicaMainUIMediator";
import { ActivityMediator } from "./Activity/ActivityMediator";
import { PicaChatMediator } from "./PicaChat/PicaChatMediator";
import { PicaNavigateMediator } from "./PicaNavigate/PicaNavigateMediator";
import { MineSettleMediator } from "./Mine/Settle/MineSettleMediator";
import { MineCarMediator } from "./MineCar/MineCarMediator";
import { InteractiveBubbleManager } from "./Bubble/interactivebubble.manager";
import { EquipUpgradeMediator } from "./EquipUpgrade/EquipUpgradeMediator";

export const enum UIType {
    NoneUIType,
    BaseUIType,
    NormalUIType,
    TipsUIType,
    MonopolyUIType, // 独占ui
}
export class UiManager extends PacketHandler {
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    private mMedMap: Map<UIMediatorType, IMediator>;
    private mUILayerManager: ILayerManager;
    private mCache: any[] = [];
    private mNoneUIMap: Map<string, any> = new Map();
    private mBaseUIMap: Map<string, any> = new Map();
    private mNormalUIMap: Map<string, any> = new Map();
    private mTipUIMap: Map<string, any> = new Map();
    private mMonopolyUIMap: Map<string, any> = new Map();
    private mCacheUI: Function;
    // 用于记录功能ui打开的顺序,最多2个
    private mShowuiList: any[] = [];
    private mInputTextFactory: InputTextFactory;
    private interBubbleMgr: InteractiveBubbleManager;
    constructor(private worldService: WorldService) {
        super();
        this.mConnect = worldService.connection;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_MARKET, this.onEnableMarket);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE, this.openMineSettle);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, this.onEnableEditMode);

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

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        this.mUILayerManager.setScene(scene);
        if (this.mCacheUI) {
            this.mCacheUI();
            this.mCacheUI = undefined;
        }
    }

    public showMainUI() {
        if (!this.mScene) {
            this.mCacheUI = this.showMainUI;
            return;
        }
        const scene = this.mScene;
        this.clearMediator();
        if (!this.mMedMap) {
            this.mMedMap = new Map();
            // ============场景中固定显示ui
            if (this.worldService.game.device.os.desktop) {
                this.mMedMap.set(BagGroupMediator.NAME, new BagGroupMediator(this.worldService, scene));
            } else {
                // this.mMedMap.set(BottomMediator.NAME, new BottomMediator(this.worldService, scene));
                // this.mMedMap.set(LeftMediator.NAME, new LeftMediator(this.worldService, scene));
                // this.mMedMap.set(TopMediator.NAME, new TopMediator(this.worldService, scene));
                // this.mMedMap.set(RightMediator.NAME, new RightMediator(this.worldService, scene));
                this.mMedMap.set(ActivityMediator.name, new ActivityMediator(this.mUILayerManager, scene, this.worldService));
                this.mMedMap.set(PicaMainUIMediator.name, new PicaMainUIMediator(this.mUILayerManager, scene, this.worldService));
                this.mMedMap.set(PicaChatMediator.name, new PicaChatMediator(this.mUILayerManager, scene, this.worldService));
                this.mMedMap.set(PicaNavigateMediator.name, new PicaNavigateMediator(this.mUILayerManager, scene, this.worldService));
                // this.mMedMap.set(MineSettleMediator.name, new MineSettleMediator(this.mUILayerManager, this.worldService));
            }
            // this.mMedMap.set(UIMediatorType.MainUIMediator, new MainUIMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.BagMediator, new BagMediator(this.mUILayerManager, this.worldService, scene));
            if (this.worldService.game.device.os.desktop) this.mMedMap.set(UIMediatorType.ChatMediator, new ChatMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, scene, this.worldService));
            this.mMedMap.set(FriendMediator.NAME, new FriendMediator(scene, this.worldService));
            // this.mMedMap.set(MineCarMediator.name, new MineCarMediator(this.mUILayerManager, scene, this.worldService));
            // this.mMedMap.set(TopMenuMediator.name, new TopMenuMediator(scene, this.worldService));
            // this.mMedMap.set(MineSettleMediator.name, new MineSettleMediator(this.mUILayerManager, scene, this.worldService));
           // this.mMedMap.set(EquipUpgradeMediator.name, new EquipUpgradeMediator(this.mUILayerManager, scene, this.worldService));
            this.interBubbleMgr = new InteractiveBubbleManager(this.mUILayerManager, this.worldService, scene);
            // this.mMedMap.set(DebugLoggerMediator.NAME, new DebugLoggerMediator(scene, this.worldService));
            // this.mMedMap.set(ElementStorageMediator.NAME, new ElementStorageMediator(this.mUILayerManager, scene, this.worldService));
            for (const tmp of this.mCache) {
                const ui = tmp[0];
                this.showMed(ui.name, ui);
            }
            this.mCache.length = 0;
        }
        // TOOD 通过统一的方法创建打开
        this.mMedMap.forEach((mediator: any, key: string) => {
            let map: Map<string, any>;
            const deskBoo: boolean = this.worldService.game.device.os.desktop ? true : false;
            switch (key) {
                case LeftMediator.NAME:
                case RightMediator.NAME:
                case BottomMediator.NAME:
                    map = this.mBaseUIMap;
                    break;
                // case TopMediator.NAME:
                //     if (deskBoo) {
                //         map = this.mBaseUIMap;
                //     }
                //     break;
                case BagGroupMediator.NAME:
                    if (deskBoo) {
                        map = this.mBaseUIMap;
                    }
                    break;
                case UIMediatorType.ChatMediator:
                    if (deskBoo) {
                        map = this.mBaseUIMap;
                    }
                    break;
                case RankMediator.NAME:
                    if (deskBoo) {
                        map = this.mBaseUIMap;
                    }
                    break;
            }
            if (map) map.set(key, mediator);
            if (mediator.isSceneUI()) {
                mediator.show();
            }
        });
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
        this.mMedMap.set(DecorateControlMediator.name, new DecorateControlMediator(this.mUILayerManager, this.mScene, this.worldService));
        this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, this.mScene, this.worldService));
        // this.mMedMap.set(TopMenuMediator.name, topMenu);
        // topMenu.addItem({
        //     key: "Turn_Btn_Top", name: "SaveDecorate", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
        //     iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        // });
        this.showAll();
    }

    public resize(width: number, height: number) {
        if (this.mMedMap) {
            this.mMedMap.forEach((mediator: IMediator) => {
                if (mediator.isShow) mediator.resize();
            });
        }
    }

    public setMediator(value: string, mediator: IMediator) {
        this.mMedMap.set(value, mediator);
    }

    public getMediator(type: string): IMediator | undefined {
        if (!this.mMedMap) return;
        return this.mMedMap.get(type);
    }

    public clearMediator() {
        if (!this.mMedMap) {
            return;
        }
        this.mMedMap.forEach((med: IMediator) => med.destroy());
        this.mMedMap.clear();
        this.mMedMap = null;
    }

    public destroy() {
        this.removePackListener();
        this.clearMediator();
        this.mMedMap = undefined;
        this.mScene = undefined;
    }

    public baseFaceResize() {
        const bottomMed = this.getMediator(BottomMediator.NAME);
        const rightMed = this.getMediator(RightMediator.NAME);
        const leftMed = this.getMediator(LeftMediator.NAME);
        // const topMed = this.getMediator(TopMediator.NAME);
        if (rightMed && rightMed.getView()) rightMed.getView().resize(0, 0);
        if (leftMed && leftMed.getView()) leftMed.getView().resize(0, 0);
        if (bottomMed && bottomMed.getView()) bottomMed.getView().resize(0, 0);
        // if (topMed && topMed.getView()) topMed.getView().resize(0, 0);
    }

    public baseFaceTween(show: boolean) {
        // if (!this.worldService.game.device.os.desktop) {
        //     (this.worldService.inputManager as JoyStickManager).tweenView(show);
        // }
        const rightMed = this.getMediator(RightMediator.NAME);
        const leftMed = this.getMediator(LeftMediator.NAME);
        const bottomMed = this.getMediator(BottomMediator.NAME);
        // const topMed = this.getMediator(TopMediator.NAME);
        if (rightMed && rightMed.getView()) rightMed.getView().tweenView(show);
        if (leftMed && leftMed.getView()) leftMed.getView().tweenView(show);
        if (bottomMed && bottomMed.getView()) bottomMed.getView().tweenView(show);
        // if (topMed && topMed.getView()) topMed.getView().tweenView(show);
    }

    public checkUIState(medName: string, show: boolean) {
        const mediator = this.mMedMap.get(medName);
        if (!mediator) return;
        const uiType: number = mediator.getUIType();
        const deskBoo: boolean = this.worldService.game.device.os.desktop;
        let map: Map<string, any>;
        switch (uiType) {
            case UIType.NoneUIType:
                map = this.mNoneUIMap;
                break;
            case UIType.BaseUIType:
                map = this.mBaseUIMap;
                break;
            case UIType.NormalUIType:
                map = this.mNormalUIMap;
                // pc端场景ui无需收进，但是功能ui可以共存，需要调整位置
                if (deskBoo) {
                    this.checkNormalUITween(show, medName);
                } else {
                    this.checkBaseUImap(show);
                }
                break;
            case UIType.MonopolyUIType:
                map = this.mMonopolyUIMap;
                this.checkBaseUImap(show);
                this.checkNormalUImap(show);
                this.chekcTipUImap(show);
                break;
            case UIType.TipsUIType:
                map = this.mTipUIMap;
                break;
        }
        map.set(medName, mediator);
    }

    public showMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            this.mCache.push(param);
            return;
        }
        if (type === "MessageBox") {
            type = "PicaMessageBox";
        }
        const className: string = type + "Mediator";
        let mediator: IMediator = this.mMedMap.get(className);
        if (!mediator) {
            const path: string = `./${type}/${type}Mediator`;
            const ns: any = require(`./${type}/${className}`);
            mediator = new ns[className](this.mUILayerManager, this.mScene, this.worldService);
            if (!mediator) {
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
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
        let topMenu: TopMenuMediator = <TopMenuMediator>this.mMedMap.get(TopMenuMediator.name);
        if (!topMenu) {
            topMenu = new TopMenuMediator(this.mScene, this.worldService);
            this.mMedMap.set(TopMenuMediator.name, topMenu);
        }
        topMenu.addItem({
            key: "Turn_Btn_Top", name: "EnterDecorate", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
            iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
    }

    private onEnableMarket() {
        if (!this.mMedMap) {
            return;
        }
        let topMenu: TopMenuMediator = <TopMenuMediator>this.mMedMap.get(TopMenuMediator.name);
        if (!topMenu) {
            topMenu = new TopMenuMediator(this.mScene, this.worldService);
            this.mMedMap.set(TopMenuMediator.name, topMenu);
        }
        topMenu.addItem({
            key: "Turn_Btn_Top", name: "Market", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
            iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
    }

    private checkBaseUImap(show: boolean) {
        this.mBaseUIMap.forEach((med) => {
            if (med) med.tweenView(show);
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
                    med.setViewAdd((i * 2 - 1) * mPad, 0);
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
                med.setViewAdd(0, 0);
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
        const mediator: IMediator = this.mMedMap.get(name);
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
        const mediator: IMediator = this.mMedMap.get(medName);
        if (!mediator) {
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
        this.mMedMap.forEach((med: IMediator) => {
            if (med.isSceneUI()) {
                med.show();
            }
        });
    }

    private closeAll() {
        if (!this.mMedMap) {
            return;
        }
        this.mMedMap.forEach((med: IMediator) => med.hide());
    }

    private openMineSettle(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE = packge.content;
        this.showMed("MineSettle", content);
    }
}
