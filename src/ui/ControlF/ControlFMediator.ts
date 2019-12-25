import { IMediator, BaseMediator } from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ControlFPanel } from "./ControlFPanel";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { PlayerState } from "../../rooms/element/element";
export class ControlFMediator extends BaseMediator {
    public static NAME: string = "ControlFMediator";
    readonly world: WorldService;
    private mScene: Phaser.Scene;
    private mLayerManager: ILayerManager;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mScene = scene;
        this.mLayerManager = layerManager;
        this.world = world;
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return undefined;
    }

    hide(): void {
        this.isShowing = false;
        if (this.mView && this.mView.isShow()) {
            if (!this.world.roomManager.currentRoom || !this.world.roomManager.currentRoom.getHero() ||
                this.world.roomManager.currentRoom.getHero().getState() === PlayerState.WALK) {
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
        if (this.mView && this.mView.isShow() || this.isShowing) {
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
        let keyArr: number[] = this.world.inputManager.getKeyDowns();
        keyArr = keyArr.concat(Phaser.Input.Keyboard.KeyCodes.F);
        content.keyCodes = keyArr;
        this.world.connection.send(pkt);
    }

}
