import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ControlFPanel } from "./ControlFPanel";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { PlayerState } from "../../rooms/element/element";
import { BasePanel } from "../components/BasePanel";
import { BaseMediator,UIType } from "tooqingui";
export class ControlFMediator extends BaseMediator {
    public static NAME: string = "ControlFMediator";
    private world: WorldService;
    private mScene: Phaser.Scene;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.mUIType = UIType.Tips;
        this.mScene = scene;
        this.mLayerManager = layerManager;
        this.world = world;
    }

    getName(): string {
        return "";
    }

    getView(): BasePanel {
        return undefined;
    }

    hide(): void {
        this.mShow = false;
        if (this.mView && this.mView.isShow()) {
            if (!this.world.roomManager.currentRoom || !this.world.roomManager.currentRoom.playerManager.actor ||
                this.world.roomManager.currentRoom.playerManager.actor.getState() === PlayerState.WALK) {
                this.mView.off("control", this.handControlF, this);
                this.mView.destroy();
                this.mView = null;
            }
        }
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        if (!this.mView) return false;
        return this.mView.isShow();
    }

    resize() {
        if (!this.mView) return;
        this.mView.resize();
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow() || this.mShow) {
            return;
        }
        this.mView = new ControlFPanel(this.mScene, this.world);
        this.mView.on("control", this.handControlF, this);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.show(param);
        super.show(param);
    }

    update(param?: any): void {
    }

    destroy() {
        if (this.mView) {
            this.mView.off("control", this.handControlF, this);
            this.mView.destroy();
            this.mView = null;
        }
        this.mScene = null;
        this.mLayerManager = null;
        super.destroy();
    }

    private handControlF() {
        if (!this.world || !this.world.connection) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        let keyArr: number[];
        if (this.world.inputManager) {
            keyArr = this.world.inputManager.getKeyDowns();
        } else {
            keyArr = [];
        }
        keyArr = keyArr.concat(Phaser.Input.Keyboard.KeyCodes.F);
        content.keyCodes = keyArr;
        this.world.connection.send(pkt);
    }

}
