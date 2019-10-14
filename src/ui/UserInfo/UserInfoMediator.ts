import { IMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { UserInfoPanel } from "./UserInfoPanel";
import { MessageType } from "../../const/MessageType";

export class UserInfoMediator implements IMediator {
    readonly world: WorldService;
    private mUserInfo: UserInfoPanel;
    constructor(private mLayerManager: ILayerManager, private mScene: Phaser.Scene, world: WorldService) {
        this.world = world;
        this.mUserInfo = new UserInfoPanel(this.mScene, world);
    }

    getView(): IAbstractPanel {
        return this.mUserInfo;
    }

    hide(): void {
        this.mUserInfo.hide();
        this.world.modelManager.off(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return this.mUserInfo.isShow();
    }

    resize() {
        this.mUserInfo.resize();
    }

    show(param?: any): void {
        if (!param || param.length === 0) {
            return;
        }
        this.mUserInfo.show(param[0]);
        this.mLayerManager.addToUILayer(this.mUserInfo);
        this.world.modelManager.on(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
    }

    destroy() {
        if (this.mUserInfo) this.mUserInfo.destroy();
    }

    update(param?: any): void {
    }

    private onClosePanel() {
        this.hide();
    }
}
