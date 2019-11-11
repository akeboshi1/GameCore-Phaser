import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Logger } from "../utils/log";
import { IMediator, BaseMediator } from "./baseMediator";
import { UIMediatorType } from "./ui.mediatorType";
import { ChatMediator } from "./chat/chat.mediator";
import { ILayerManager, LayerManager } from "./layer.manager";
import { NoticeMediator } from "./Notice/NoticeMediator";
import { BagMediator } from "./bag/bagView/bagMediator";
import { MainUIMediator } from "./baseView/mainUI.mediator";
import { DebugLoggerMediator } from "./debuglog/debug.logger.mediator";

export class UiManager extends PacketHandler {
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    private mMedMap: Map<UIMediatorType, IMediator>;
    private mUILayerManager: ILayerManager;
    private mCache: any[] = [];
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
            this.mMedMap.set(UIMediatorType.BagMediator, new BagMediator(this.worldService, scene));
            if (this.worldService.game.device.os.desktop) this.mMedMap.set(UIMediatorType.ChatMediator, new ChatMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, scene, this.worldService));
            // this.mMedMap.set(DebugLoggerMediator.NAME, new DebugLoggerMediator(scene, this.worldService));
            for (const tmp of this.mCache) {
                const ui = tmp[0];
                this.showMed(ui.name, ui);
            }
            this.mCache.length = 0;
        }

        // TOOD 通过统一的方法创建打开
        this.mMedMap.forEach((mediator: IMediator) => {
            if (mediator.isSceneUI()) mediator.show();
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

    private showMed(type: string, ...params: any[]) {
        if (!this.mMedMap) {
            this.mCache.push(params);
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
        if (mediator.isShow()) return;
        mediator.show(params);
    }

    private updateMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            return;
        }
        const mediator: IMediator = this.mMedMap.get(type);
        if (!mediator) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        mediator.update(param);
    }

    private hideMed(type: string) {
        if (!this.mMedMap) {
            return;
        }
        const mediator: IMediator = this.mMedMap.get(type + "Mediator");
        if (!mediator) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (!mediator.isShow()) return;
        mediator.hide();
    }
}
