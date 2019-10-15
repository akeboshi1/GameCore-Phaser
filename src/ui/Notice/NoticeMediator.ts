import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";
import { NoticePanel } from "./NoticePanel";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { IMediator } from "../baseMediator";

export class NoticeMediator extends PacketHandler implements IMediator {
    readonly world: WorldService;
    private mNoticePanel: NoticePanel;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.mLayerManager = layerManager;
        this.mScene = scene;
        const connect = worldService.connection;
        if (connect) {
            connect.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_NOTICE, this.noticeHandler);
        }

    }

    getView(): IAbstractPanel {
        return this.mNoticePanel;
    }

    hide(): void {
        if (!this.mNoticePanel) return;
        this.mNoticePanel.hide();
    }

    destroy() {
        if (this.mNoticePanel) {
            this.mNoticePanel.destroy();
            this.mNoticePanel = null;
        }
        this.mScene = null;
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return this.mNoticePanel.isShow();
    }

    resize() {
        if (!this.mNoticePanel) return;
        this.mNoticePanel.resize();
    }

    show(param?: any): void {
        if (this.mNoticePanel && this.mNoticePanel.isShow()) {
            return;
        }
        this.mNoticePanel = new NoticePanel(this.mScene);
        this.mNoticePanel.show(param);
        this.mNoticePanel.showNotice(param);
        this.mLayerManager.addToDialogLayer(this.mNoticePanel);
    }

    update(param?: any): void {
    }

    private noticeHandler(packet: PBpacket) {
        this.show(packet.content);
    }
}
