import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { ILayerManager } from "../layer.manager";
import { NoticePanel } from "./NoticePanel";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { IMediator } from "../baseMediator";
import { World } from "../../game/world";
import { UIType } from "../ui.manager";
import { MessageType } from "../../const/MessageType";

export class NoticeMediator extends PacketHandler implements IMediator {
    public static NAME: string = "NoticeMediator";
    readonly world: WorldService;
    private mNoticePanel: NoticePanel;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mParam: any;
    private mUIType: number;
    private mAddWid: number = 0;
    private mAddHei: number = 0;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mLayerManager = layerManager;
        this.mScene = scene;
        this.mUIType = UIType.TipsUIType;
        const connect = worldService.connection;
        if (connect) {
            connect.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_NOTICE, this.noticeHandler);
        }
        // this.world.emitter.on(World.SCALE_CHANGE, this.scaleChange, this);
        this.world.emitter.on(MessageType.SHOW_NOTICE, this.noticeHandler, this);
    }

    public setViewAdd(wid: number, hei: number) {
        this.mAddWid = wid;
        this.mAddHei = hei;
    }

    public setUiScale(value: number) {
        this.mNoticePanel.scaleX = this.mNoticePanel.scaleY = value;
    }

    getView(): IAbstractPanel {
        return this.mNoticePanel;
    }

    getUIType(): number {
        return this.mUIType;
    }

    hide(): void {
        if (!this.mNoticePanel) return;
        this.mNoticePanel.hide();
        this.mNoticePanel = null;
    }

    destroy() {
        this.world.emitter.off(World.SCALE_CHANGE, this.scaleChange, this);
        this.world.emitter.off(MessageType.SHOW_NOTICE, this.noticeHandler, this);
        if (this.mNoticePanel) {
            this.mNoticePanel.destroy();
            this.mNoticePanel = null;
        }
        const connect = this.world.connection;
        if (connect) {
            connect.removePacketListener(this);
        }
        this.mScene = null;
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return this.mNoticePanel.isShow();
    }

    showing(): boolean {
        return false;
    }

    tweenView(show: boolean) {
    }

    resize() {
        if (!this.mNoticePanel) return;
        this.mNoticePanel.resize(this.mAddWid, this.mAddHei);
    }

    show(param?: any): void {
        if (this.mNoticePanel && this.mNoticePanel.isShow()) {
            this.mNoticePanel.showNotice(param);
            return;
        }
        this.mNoticePanel = new NoticePanel(this.mScene, this.world);
        this.mNoticePanel.show(param);
        this.mNoticePanel.showNotice(param);
        this.mLayerManager.addToDialogLayer(this.mNoticePanel);
        // this.setUiScale(this.world.uiScale);
    }

    update(param?: any): void {
        this.mParam = param;
        if (!this.mNoticePanel) return;
    }

    setParam(param: any) {
        this.mParam = param;
    }

    getParam(): any {
        return this.mParam;
    }

    private scaleChange() {
        this.setUiScale(this.world.uiScale);
    }

    private noticeHandler(packet: PBpacket) {
        if (!packet || !packet.content) {
            return;
        }
        this.show(packet.content);
    }
}
