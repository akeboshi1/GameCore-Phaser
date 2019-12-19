import { IMediator, BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { UserInfoPanel } from "./UserInfoPanel";
import { MessageType } from "../../const/MessageType";

export class UserInfoMediator extends BaseMediator {
    readonly world: WorldService;
    constructor(private mLayerManager: ILayerManager, private mScene: Phaser.Scene, world: WorldService) {
        super(world);
        this.world = world;
        this.mView = new UserInfoPanel(this.mScene, world);
    }

    getView(): IAbstractPanel {
        return this.mView;
    }

    hide(): void {
        this.isShowing = false;
        this.mView.hide();
        this.mView = null;
        this.world.emitter.off(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return this.mView.isShow();
    }

    resize() {
        this.mView.resize();
    }

    show(param?: any): void {
        if (!param || param.length === 0) {
            return;
        }
        this.mView.show(param[0]);
        this.mLayerManager.addToUILayer(this.mView);
        this.world.emitter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        super.show(param);
    }

    destroy() {
        if (this.mView) this.mView.destroy();
    }

    update(param?: any): void {
    }

    private onClosePanel() {
        this.hide();
    }
}
