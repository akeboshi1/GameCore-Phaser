import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { FriendPanel } from "./friend.panel";
import { UIType } from "../ui.manager";

export class FriendMediator extends BaseMediator {
    public static NAME: string = "FriendMediator";
    private mScene: Phaser.Scene;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mUIType = UIType.NormalUIType;
        this.mScene = scene;
    }

    public isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize(this.mAddWid, this.mAddHei);
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
        this.isShowing = false;
        if (this.mView) this.mView = null;
    }

    public destroy() {
        super.destroy();
    }
}
