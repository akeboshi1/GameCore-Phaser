import { WorldService } from "../../../game/world.service";
import { BaseFaceMediator } from "../BaseFace.mediator";
import { BottomBtnGroup } from "./Bottom.btn.group";

export class BottomMediator extends BaseFaceMediator {
    public static NAME: string = "BottomMediator";
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld, scene);
    }

    public show(param?: any) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new BottomBtnGroup(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
    }
}
