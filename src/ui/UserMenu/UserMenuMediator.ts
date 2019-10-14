import { IMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { UserMenuPanel } from "./UserMenuPanel";
import { ILayerManager } from "../layer.manager";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { MessageType } from "../../const/MessageType";

export class UserMenuMediator implements IMediator {
    readonly world: WorldService;
    private mScene: Phaser.Scene;
    private mUserMenuPanel: UserMenuPanel;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        this.world = worldService;
        this.mLayerManager = layerManager;
        this.mScene = scene;
        this.mUserMenuPanel = new UserMenuPanel(scene);
    }

    getView(): IAbstractPanel {
        return undefined;
    }

    hide(): void {
        this.world.modelManager.off(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        if (this.mUserMenuPanel) {
            this.mUserMenuPanel.off("menuClick", this.onClickMenuHandler, this);
            this.mUserMenuPanel.hide();
        }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        this.mUserMenuPanel.resize();
    }

    show(param?: any): void {
        this.mUserMenuPanel.show(param[0]);
        this.mLayerManager.addToUILayer(this.mUserMenuPanel);
        this.world.modelManager.on(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
        this.mUserMenuPanel.on("menuClick", this.onClickMenuHandler, this);
        // this.mScene.input.on("pointerdown", this.onClosePanel, this);
    }

    update(param?: any): void {
        this.mUserMenuPanel.update(param[0]);
    }

    destroy() {
        if (this.mUserMenuPanel) {
            this.mUserMenuPanel.destroy();
            this.mUserMenuPanel = null;
        }
        this.mScene = null;
    }

    private onClickMenuHandler(targetNode) {
        const uiNode: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mUserMenuPanel.getData("data");
        if (!targetNode || !uiNode || !this.world || !this.world.connection) return;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiNode.id;
        content.componentId = targetNode.id;
        this.world.connection.send(pkt);

        this.hide();
    }

    private onClosePanel(pointer, gameObject) {
        this.hide();
    }

}
