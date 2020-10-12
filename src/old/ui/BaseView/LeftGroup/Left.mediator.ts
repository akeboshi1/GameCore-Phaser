import { BaseFaceMediator } from "../BaseFace.mediator";
import { LeftBtnGroup } from "./Left.btn.group";
import { WorldService } from "../../../world.service";

export class LeftMediator extends BaseFaceMediator {
    public static NAME: string = "LeftMediator";
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld, scene);
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
