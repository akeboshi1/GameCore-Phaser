import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { PicaMainUIPanel } from "./PicaMainUIPanel";
import { op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class PicaMainUIMediator extends BaseMediator {
    public static NAME: string = "PicaMainUIMediator";
    private world: WorldService;
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
    }

    show() {
        if (this.mView && this.mView.isShow() || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicaMainUIPanel(this.scene, this.world);
        }
        this.mView.show();
        this.mView.on("enterEdit", this.onEnterEditSceneHandler, this);
        this.layerManager.addToUILayer(this.mView.view);
    }

    isSceneUI() {
        return true;
    }

    private onEnterEditSceneHandler() {
        if (!this.world || !this.world.roomManager || !this.world.roomManager.currentRoom) {
            return;
        }
        if (this.world.roomManager.currentRoom.enableEdit) {
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER);
            this.world.connection.send(packet);
        }
    }
}
