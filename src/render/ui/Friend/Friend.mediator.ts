import { FriendPanel } from "./Friend.panel";
import { BaseMediator, UIType } from "apowophaserui";
import { WorldService } from "../../world.service";

export class FriendMediator extends BaseMediator {
    public static NAME: string = "FriendMediator";
    private mScene: Phaser.Scene;
    private world: WorldService;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super();
        this.mUIType = UIType.Normal;
        this.mScene = scene;
        this.world = world;
    }

    public isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public show(param?: any) {
        const friendMed = this;
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new FriendPanel(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
    }

    public hide() {
        this.mShow = false;
        if (this.mView) this.mView = null;
    }

    public destroy() {
        super.destroy();
    }
}