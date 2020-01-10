import { BaseFaceMediator } from "../baseFace.mediator";
import { WorldService } from "../../../game/world.service";
import { LeftBtnGroup } from "./left.btn.group";

export class LeftMediator extends BaseFaceMediator {
    public static NAME: string = "LeftMediator";
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld, scene);
    }
    public tweenView(show: boolean) {
        if (this.mView) (this.mView as LeftBtnGroup).tweenView(show);
    }

    public show(param?: any) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new LeftBtnGroup(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
    }
}
