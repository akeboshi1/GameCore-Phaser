import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { MessageBoxView } from "./MessageBoxView";
import { NinePatchButton } from "../components/ninepatch.button";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";

export class MessageBoxMediator extends BaseMediator {
    private world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.world = world;
        this.mScene = scene;
        this.mLayerManager = layerManager;
        this.mUIType = UIType.Tips;
    }

    public isSceneUI(): boolean {
        return false;
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }

    public show(param?: any): void {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new MessageBoxView(this.mScene, this.world);
        this.mView.show(param);
        this.mLayerManager.addToToolTipsLayer(this.mView.view);
        this.mScene.input.on("gameobjectdown", this.onBtnHandler, this);
        super.show(param);
    }

    public update(param?: any): void {
        super.update(param);
    }

    public hide() {
        this.mShow = false;
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    public destroy() {
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
        super.destroy();
    }

    private onBtnHandler(pointer, gameobject) {
        if (!gameobject) return;
        if (gameobject instanceof NinePatchButton) {
            const btn = (gameobject as NinePatchButton).getBtnData();
            if (!btn) {
                return;
            }
            const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
            content.uiId = param.id;
            content.componentId = btn.node.id;
            this.world.connection.send(pkt);
        }
    }
}
