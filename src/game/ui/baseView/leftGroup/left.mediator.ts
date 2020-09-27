import { BaseFaceMediator } from "../BaseFace.mediator";
import { WorldService } from "../../../game/world.service";
import { LeftBtnGroup } from "./Left.btn.group";

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
