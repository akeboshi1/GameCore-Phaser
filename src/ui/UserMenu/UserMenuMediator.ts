import {IMediator} from "../baseMediator";
import {IAbstractPanel} from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import {UserMenuPanel} from "./UserMenuPanel";
import {ILayerManager} from "../layer.manager";
import {PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "pixelpai_proto";

export class UserMenuMediator implements IMediator {
    readonly world: WorldService;
    private mUserMenuPanel: UserMenuPanel;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        this.world = worldService;
        this.mUserMenuPanel = new UserMenuPanel(scene);
        layerManager.addToUILayer(this.mUserMenuPanel);

        this.mUserMenuPanel.on("clickMenu", this.onClickMenuHandler, this);
    }

    getView(): IAbstractPanel {
        return undefined;
    }

    hide(): void {
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
        this.mUserMenuPanel.show(param);
    }

    update(param?: any): void {
        this.mUserMenuPanel.update(param);
    }

    private onClickMenuHandler(targetNode) {
        const uiNode: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mUserMenuPanel.getData("data");
        if (!targetNode || !uiNode || !this.world || this.world.connection) return;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiNode.id;
        content.componentId = targetNode.id;
        this.world.connection.send(pkt);
    }

}
