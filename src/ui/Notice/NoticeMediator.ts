import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { NoticePanel } from "./NoticePanel";
import { PBpacket } from "net-socket-packet";
import { MessageType } from "../../const/MessageType";
import { BasePanel } from "../components/BasePanel";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { Notice } from "./Notice";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";

export class NoticeMediator extends BaseMediator {
    public static NAME: string = "NoticeMediator";
    private world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private notice: Notice;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mLayerManager = layerManager;
        this.mScene = scene;
        this.notice = new Notice(worldService);
        this.mUIType = UIType.Tips;
        this.addListen();
    }

    public setUiScale(value: number) {
        this.mView.scale = value;
    }

    getView(): BasePanel {
        return this.mView !== undefined ? this.mView.view : undefined;
    }

    getUIType(): number {
        return this.mUIType;
    }

    hide(): void {
        if (!this.mView) return;
        super.hide();
    }

    destroy() {
        this.removeListen();
        this.notice.unregister();
        this.notice = null;
        super.destroy();
    }

    isShow(): boolean {
        return this.mView.isShow();
    }

    resize() {
        if (!this.mView) return;
        this.mView.resize();
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow()) {
            (this.mView as NoticePanel).showNotice(param);
            return;
        }
        this.mView = new NoticePanel(this.mScene, this.world);
        this.mView.show(param);
        (this.mView as NoticePanel).showNotice(param);
        this.mLayerManager.addToDialogLayer(this.mView.view);
        // this.setUiScale(this.world.uiScale);
    }

    update(param?: any): void {
        this.mParam = param;
        if (!this.mView) return;
    }

    setParam(param: any) {
        this.mParam = param;
    }

    getParam(): any {
        return this.mParam;
    }

    private addListen() {
        this.notice.on("showNotice", this.noticeHandler, this);
        this.world.emitter.on(MessageType.SHOW_NOTICE, this.noticeHandler, this);
        this.notice.register();
    }

    private removeListen() {
        this.notice.off("showNotice", this.noticeHandler, this);
        this.world.emitter.off(MessageType.SHOW_NOTICE, this.noticeHandler, this);
    }

    private noticeHandler(packet: PBpacket) {
        if (!packet || !packet.content) {
            return;
        }
        this.show(packet.content);
    }
}
