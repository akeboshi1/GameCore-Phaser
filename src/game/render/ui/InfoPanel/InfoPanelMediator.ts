import { ILayerManager } from "../Layer.manager";
import { InfoPanel } from "./InfoPanel";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";
import { MessageType } from "../../../../const/MessageType";
import { Tool } from "../../../../utils/tool";

export class InfoPanelMediator extends BaseMediator {
    public static NAME: string = "InfoPanelMediator";
    private world: WorldService;
    constructor(private mLayerManager: ILayerManager, private mScene: Phaser.Scene, world: WorldService) {
        super();
        this.world = world;
    }

    hide(): void {
        this.mShow = false;
        this.world.emitter.off(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    resize() {
        if (this.mView) this.mView.resize();
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        if (!param || param.length === 0) {
            return;
        }
        this.mView = new InfoPanel(this.mScene, this.world);
        this.mView.show(param[0]);
        this.mLayerManager.addToUILayer(this.mView);
        this.world.emitter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        super.show(param);
    }

    destroy() {
        if (this.mView) this.mView.destroy();
    }

    update(param?: any): void {
        if (this.mView) this.mView.update(param);
    }

    private onClosePanel(pointer: Phaser.Input.Pointer) {
        if (Tool.checkPointerContains(this.mView, pointer)) return;
        this.hide();
    }
}
