import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ItemDetail } from "./ItemDetail";
import { ILayerManager } from "../layer.manager";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { NinePatchButton } from "../components/ninepatch.button";

export class ItemDetailMediator extends BaseMediator {
    readonly world: WorldService;
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mParam: any;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.world = world;
        this.mScene = scene;
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
        this.mParam = param;
        this.mLayerManager.addToUILayer(this.mView);
        this.mScene.input.on("gameobjectdown", this.onBtnHandler, this);
        this.isShowing = true;
    }
    public update(param?: any): void {
        super.update(param);
    }

    public hide() {
        this.mScene.input.off("gameobjectdown", this.onBtnHandler, this);
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
