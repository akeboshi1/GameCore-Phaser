import { WorldService } from "../../game/world.service";
import { UserMenuPanel } from "./UserMenuPanel";
import { ILayerManager } from "../Layer.manager";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { MessageType } from "../../messageType/MessageType";
import { BasePanel } from "../Components/BasePanel";
import { BaseMediator, UIType } from "apowophaserui";
export class UserMenuMediator extends BaseMediator {
    private world: WorldService;
    private mScene: Phaser.Scene;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mLayerManager = layerManager;
        this.mScene = scene;
        this.mUIType = UIType.Tips;
    }

    getView(): BasePanel {
        return this.mView as BasePanel;
    }

    hide(): void {
        this.mShow = false;
        this.world.emitter.off(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        if (this.mView) {
            this.mView.off("menuClick", this.onClickMenuHandler, this);
            this.mView.hide();
            this.mView = null;
        }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        if (this.mView) this.mView.resize();
    }

    show(param?: any): void {
        // if (this.mView && this.mView.isShow()) {
        //     return;
        // }
        // this.mView = new UserMenuPanel(this.mScene, this.world);
        // this.mView.show(param[0]);
        // this.mLayerManager.addToUILayer(this.mView);
        // this.world.emitter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        // this.mView.on("menuClick", this.onClickMenuHandler, this);
        // super.show(param);
        // this.mScene.input.on("pointerdown", this.onClosePanel, this);
    }

    update(param?: any): void {
        if (this.mView) this.mView.update(param[0]);
    }

    destroy() {
        if (this.mView) {
            this.mView.destroy();
            this.mView = null;
        }
        this.mScene = null;
    }

    private onClickMenuHandler(targetNode) {
        if (!this.mView) return;
        const uiNode: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mView.getData("data");
        if (!targetNode || !uiNode || !this.world || !this.world.connection) return;
        this.hide();
        if (targetNode.platformid) {
            if (targetNode.text === "关注") {
                this.world.httpService.follow(targetNode.platformid);
            } else if (targetNode.text === "取消关注") {
                this.world.httpService.unfollow(targetNode.platformid);
            }
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiNode.id;
        content.componentId = targetNode.id;
        this.world.connection.send(pkt);
    }

    private onClosePanel(pointer, gameObject) {
        this.hide();
    }

}
