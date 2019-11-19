import { IMediator, BaseMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ControlFPanel } from "./ControlFPanel";
import { Logger } from "../../utils/log";
import { ComponentRankPanel } from "../ComponentRank/ComponentRankPanel";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
export class ControlFMediator extends BaseMediator {
    readonly world: WorldService;
    private mScene: Phaser.Scene;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        // this.mView = new ControlFPanel(scene);
        // this.mView.on("control", this.handControlF, this);
        // layerManager.addToUILayer(this.mView);
        this.mLayerManager = layerManager;
        this.world = world;
        this.mScene = scene;
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return undefined;
    }

    hide(): void {
        if (this.mView) {
            this.mView.off("control", this.handControlF, this);
            this.mView.hide();
            this.mView = null;
        }
        // if (this.mView) {
        //     this.mView.off("control22", this.handControlF, this);
        // }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        this.mView.resize();
    }

    show(param?: any): void {
        // this.mView.show(param);
        // if (this.mView) {
        //     this.mView.on("control22", this.handControlF, this);
        // }

        if (this.mView && this.mView.isShow()) {
            return;
        }
        this.mView = new ControlFPanel(this.mScene);
        this.mView.on("control", this.handControlF, this);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.show(param);
        super.show(param);
    }

    update(param?: any): void {
    }

    destroy() {
        if (this.mView) {
            this.mView.destroy();
            this.mView = null;
        }
        this.mScene = null;
        this.mLayerManager = null;
    }

    private handControlF() {
        if (!this.world || !this.world.connection) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        let keyArr: number[] = this.world.inputManager.getKeyDowns();
        keyArr = keyArr.concat(Phaser.Input.Keyboard.KeyCodes.F);
        content.keyCodes = keyArr;
        this.world.connection.send(pkt);
    }

}
