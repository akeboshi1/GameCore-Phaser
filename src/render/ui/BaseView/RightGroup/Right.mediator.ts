import { BaseFaceMediator } from "../BaseFace.mediator";
import { RightBtnGroup } from "./Right.btn.group";
import { WorldService } from "../../../world.service";
import { MessageType } from "../../../../structureinterface/message.type";
export class RightMediator extends BaseFaceMediator {
    public static NAME: string = "RightMediator";
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld, scene);
    }
    public tweenView(show: boolean) {
        if (this.mView) (this.mView as RightBtnGroup).tweenView(show);
    }

    public show(param?: any) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new RightBtnGroup(this.mScene, this.world);
        this.mView.show(param);
        this.world.emitter.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.world.emitter.on(MessageType.PACKAGE_ITEM_ADD, this.heroItemChange, this);
        super.show(param);
    }

    public hide() {
        this.mShow = false;
        this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.world.emitter.off(MessageType.PACKAGE_ITEM_ADD, this.heroItemChange, this);
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    private heroItemChange() {
        if (!this.world.roomManager.currentRoom || !this.world.roomManager.currentRoom.playerManager || !this.world.roomManager.currentRoom.playerManager.actor) return;
        if (this.mView) {
            if (this.mView) (this.mView as RightBtnGroup).refreshSlot();
        }
    }
}
