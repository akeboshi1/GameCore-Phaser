import { IMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ControlFPanel } from "./ControlFPanel";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { ComponentRankPanel } from "../ComponentRank/ComponentRankPanel";

export class ControlFMediator implements IMediator {
    readonly world: WorldService;
    private mControlF: ControlFPanel;
    private mScene: Phaser.Scene;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        // this.mControlF = new ControlFPanel(scene);
        // this.mControlF.on("control", this.handControlF, this);
        // layerManager.addToUILayer(this.mControlF);
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
        if (this.mControlF) {
            this.mControlF.off("control", this.handControlF, this);
            this.mControlF.hide();
            this.mControlF = null;
        }
        // if (this.mControlF) {
        //     this.mControlF.off("control22", this.handControlF, this);
        // }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        this.mControlF.resize();
    }

    show(param?: any): void {
        // this.mControlF.show(param);
        // if (this.mControlF) {
        //     this.mControlF.on("control22", this.handControlF, this);
        // }

        if (this.mControlF && this.mControlF.isShow()) {
            return;
        }
        this.mControlF = new ControlFPanel(this.mScene);
        this.mControlF.on("control", this.handControlF, this);
        this.mLayerManager.addToUILayer(this.mControlF);
        this.mControlF.show(param);
    }

    update(param?: any): void {
    }

    destroy() {
        if (this.mControlF) {
            this.mControlF.destroy();
            this.mControlF = null;
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
