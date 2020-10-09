import { BaseFaceMediator } from "../BaseFace.mediator";
import { op_gameconfig, op_client } from "pixelpai_proto";
import { BagGroup } from "./Bag.group";
import { UIType } from "apowophaserui";
import { WorldService } from "../../../world.service";
import { MessageType } from "../../../../messageType/MessageType";
import { Size } from "../../../../utils/size";

/**
 * 背包场景UI，带背包slot，pc端用
 */
export class BagGroupMediator extends BaseFaceMediator {
    public static NAME: string = "BagGroupMediator";
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld, scene);
        this.mUIType = UIType.Scene;
    }
    public isSceneUI(): boolean {
        return true;
    }

    public isShow(): boolean {
        if (this.mView) {
            return this.mView.isShow();
        }
    }

    public show(param?: any) {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        const size: Size = this.world.getSize();
        this.mView = new BagGroup(this.mScene, this.world, (size.width >> 1) - 29, size.height - 50);
        this.mView.show(param);
        this.addListen();
        super.show(param);
    }

    public update(param: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        this.mShow = false;
        this.removeListen();
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    private addListen() {
        this.world.emitter.on(MessageType.QUERY_PACKAGE, this.queryPackAge, this);
        this.world.emitter.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.world.emitter.on(MessageType.PACKAGE_ITEM_ADD, this.heroItemChange, this);
    }

    private removeListen() {
        this.world.emitter.off(MessageType.QUERY_PACKAGE, this.queryPackAge, this);
        this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.world.emitter.off(MessageType.PACKAGE_ITEM_ADD, this.heroItemChange, this);
    }

    private heroItemChange() {
        if (!this.world.roomManager.currentRoom || !this.world.roomManager.currentRoom.playerManager || !this.world.roomManager.currentRoom.playerManager.actor) return;
        const itemList: op_gameconfig.IItem[] = this.world.roomManager.currentRoom.playerManager.actor.package.items;
        if (this.mView) {
            (this.mView as BagGroup).setDataList(itemList);
        }
    }

    private queryPackAge(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
        if (!this.world.roomManager.currentRoom || !this.world.roomManager.currentRoom.playerManager || !this.world.roomManager.currentRoom.playerManager.actor) return;
        if (data.id !== this.world.roomManager.currentRoom.playerManager.actor.package.id) return;
        if (this.mView) {
            (this.mView as BagGroup).setDataList(data.items);
        }
    }
}
