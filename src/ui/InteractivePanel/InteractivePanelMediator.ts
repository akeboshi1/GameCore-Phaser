import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { InteractivePanel } from "./InteractivePanel";
import { BaseMediator, UIType, Panel } from "apowophaserui";
import { op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";

export class InteractivePanelMediator extends BaseMediator {
    public static NAME: string = "InteractivePanelMediator";
    private mScene: Phaser.Scene;
    private world: WorldService;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.mUIType = UIType.Monopoly;
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
        if (this.mView && this.mView.isShow) return this.mView.resize();
    }

    public getView(): Panel {
        return this.mView;
    }

    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new InteractivePanel(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
    }

    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
        if (!this.mView || !this.mView.isShow) {
            return;
        }
        super.update(param);
    }

    public hide() {
        this.mShow = false;
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    public destroy() {
        this.world = null;
        this.mScene = null;
        this.mParam = null;
        super.destroy();
    }

    public componentClick(componentID: number) {
        if (this.mParam && this.mParam.length > 0) {
            // this.world.roomManager.currentRoom.playerManager.actor.getInteractive().requestTargetUI(this.mParam[0].id, componentID);
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
            content.uiId = this.mParam[0].id;
            content.componentId = componentID;
            this.world.connection.send(pkt);
        }
    }
}
