import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Logger } from "../utils/log";
import { IMediator } from "./baseMediator";
import { UIMediatorType } from "./ui.mediatorType";
import { ChatMediator } from "./chat/chat.mediator";
import { ILayerManager, LayerManager } from "./layer.manager";
import { NoticeMediator } from "./Notice/NoticeMediator";
import { BagMediator } from "./bag/bagView/bagMediator";
import { MainUIMediator } from "./baseView/mainUI.mediator";
import { FriendMediator } from "./friend/friend.mediator";
import { RankMediator } from "./Rank/RankMediator";
import { Size } from "../utils/size";

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
    // 用于记录功能ui打开的顺序,最多2个
    private mShowuiList: any[] = [];
    constructor(private worldService: WorldService) {
        super();
        this.mConnect = worldService.connection;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        this.mUILayerManager = new LayerManager();
    }

    public addPackListener() {
        if (this.mConnect) {
            this.mConnect.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.mConnect) {
            this.mConnect.removePacketListener(this);
        }
    }

    public getUILayerManager(): ILayerManager {
        return this.mUILayerManager;
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        this.mUILayerManager.setScene(scene);
        if (!this.mMedMap) {
            this.mMedMap = new Map();
            // ============场景中固定显示ui
            this.mMedMap.set(UIMediatorType.MainUIMediator, new MainUIMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.BagMediator, new BagMediator(this.mUILayerManager, this.worldService, scene));
            if (this.worldService.game.device.os.desktop) this.mMedMap.set(UIMediatorType.ChatMediator, new ChatMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, scene, this.worldService));
            this.mMedMap.set(FriendMediator.NAME, new FriendMediator(scene, this.worldService));
            // this.mMedMap.set(DebugLoggerMediator.NAME, new DebugLoggerMediator(scene, this.worldService));
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
                case UIMediatorType.MainUIMediator:
                    map = this.mBaseUIMap;
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

    public destroy() {
        this.removePackListener();
        if (this.mMedMap) {
            this.mMedMap.forEach((mediator: IMediator) => {
                mediator.destroy();
                mediator = null;
            });
            this.mMedMap.clear();
        }
        this.mMedMap = null;
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

    private showMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            this.mCache.push(param);
            return;
        }
        const className: string = type + "Mediator";
        let mediator: IMediator = this.mMedMap.get(className);
        if (!mediator) {
            const path: string = `./${type}/${type}Mediator`;
            const ns: any = require(`./${type}/${className}`);
            mediator = new ns[className](this.mUILayerManager, this.mScene, this.worldService);
            if (!mediator) {
                Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type + "Mediator", mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        if (className === "RankMediator") {
            if (!this.worldService.game.device.os.desktop) {
                const med: MainUIMediator = this.getMediator(MainUIMediator.NAME) as MainUIMediator;
                if (med) {
                    if (!med.isShow()) {
                        med.preRefreshBtn(className);
                    } else {
                        med.refreshBtn(className, true);
                    }
                }
                return;
            }
        }
        this.checkUIState(className, false);
        mediator.show(param);
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
            const mPad: number = len > 1 ? size.width / 4 : 0;
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
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (param) mediator.setParam(param);
        mediator.update(param);
    }

    private hideMed(type: string) {
        if (!this.mMedMap) {
            return;
        }
        const className: string = `${type}Mediator`;
        const mediator: IMediator = this.mMedMap.get(className);
        if (!mediator) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (!this.worldService.game.device.os.desktop && className === "RankMediator") {
            const med: MainUIMediator = this.getMediator(MainUIMediator.NAME) as MainUIMediator;
            if (med) {
                if (!med.isShow()) {
                    med.preRefreshBtn(className);
                } else {
                    med.refreshBtn(className, true);
                }
            }
        }
        // if (!mediator.isShow()) return;
        this.checkUIState(className, true);
        mediator.hide();
    }
}
