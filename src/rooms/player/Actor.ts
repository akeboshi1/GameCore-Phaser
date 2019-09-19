import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { ISprite } from "../element/sprite";
import { IRoomService } from "../room";
import { InputListener } from "../../game/input.service";
import {Logger} from "../../utils/log";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world, op_client} from "pixelpai_proto";

// ME 我自己
export class Actor extends Player implements InputListener {
    readonly GameObject: Phaser.GameObjects.GameObject;
    private mRoom: IRoomService;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mRenderable = true; // Actor is always renderable!!!
        this.addDisplay();
        this.mRoom = this.mElementManager.roomService;

        this.mRoom.world.inputManager.addListener(this);

        if (this.mElementManager) {
            const roomService = this.mElementManager.roomService;
            if (roomService && roomService.cameraService) {
                roomService.cameraService.startFollow(this.mDisplay);
            }
        }
    }

    // override super's method.
    public setRenderable(isRenderable: boolean): void {
        // do nothing!
        // Actor is always renderable!!!
    }

    downHandler(d: number, keyList: number[]) {
        this.mRoom.requestActorMove(d, keyList); // startActorMove();
    }

    upHandler() {
        // this.mRoom.playerManager.stopActorMove();
        this.stopMove();
    }

    public stopMove() {
        super.stopMove();
        delete this.mMoveData.destPos;
        this.mMoveData.arrivalTime = 0;
        if (this.mMoveData.tweenAnim) {
            this.mMoveData.tweenAnim.stop();
            this.mMoveData.tweenAnim.remove();
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE = pkt.content;
        ct.nodeType = this.nodeType;
        const pos = this.getPosition();
        ct.spritePositions = {
            id: this.id,
            point3f: {
                x: pos.x,
                y: pos.y,
                z: pos.z,
            },
            direction: this.dir
        };
        this.mElementManager.connection.send(pkt);
    }

    public move(moveData: op_client.IMoveData) {
        // TODO 不能仅判断walk, 移动状态可能还有run
        if (this.mCurState !== "walk") {
            return;
        }
        super.move(moveData);
    }

    protected onMoveStart() {
    }

    protected onMoveComplete() {
        if (this.mCurState !== "walk") {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        this._doMove();
    }

    protected onMoveing() {
        if (this.mCurState !== "walk") {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        const now = this.roomService.now();
        if ((now - this.mMoveData.tweenLastUpdate | 0) >= 50) {
            this.setDepth();
            this.mMoveData.tweenLastUpdate = now;
        }
    }
}
