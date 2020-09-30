import { ItemDetail } from "./ItemDetail";
import { ILayerManager } from "../Layer.manager";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { NinePatchButton } from "../Components/Ninepatch.button";
import { BaseMediator, UIType } from "apowophaserui";
import { WorldService } from "../../world.service";
export class ItemDetailMediator extends BaseMediator {
    private world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.world = world;
        this.mScene = scene;
        this.mUIType = UIType.Tips;
        this.mLayerManager = layerManager;
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
        this.mView = new ItemDetail(this.mScene, this.world);
        this.mView.show(param);
        this.mLayerManager.addToToolTipsLayer(this.mView);
        this.mScene.input.on("gameobjectdown", this.onBtnHandler, this);
        this.mShow = true;
    }
    public update(param?: any): void {
        super.update(param);
    }

    public hide() {
        if (!this.mView) return;
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
        this.mView.hide();
        this.mView = null;
        super.hide();
    }

    public destroy() {
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
        super.destroy();
    }

    private onBtnHandler(pointer, gameobject) {
        if (!gameobject) return;
        if (gameobject instanceof NinePatchButton) {
            const param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mParam[0];
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
            content.uiId = param.id;
            content.componentId = (gameobject as NinePatchButton).getBtnData().node.id;
            this.world.connection.send(pkt);
        }
    }
}
