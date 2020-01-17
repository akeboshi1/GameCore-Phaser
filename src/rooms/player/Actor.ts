import { IElementManager } from "../element/element.manager";
import { ISprite } from "../element/sprite";
import { IRoomService } from "../room";
import { InputListener } from "../../game/input.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_gameconfig } from "pixelpai_proto";
import { Player } from "./player";
import { Bag } from "./bag/bag";
import { Interactive } from "./interactive/interactive";
import { Friend } from "./friend/friend";
import { PlayerModel } from "./player.model";
import { PlayerState } from "../element/element";
import { Logger } from "../../utils/log";
import { ControlFMediator } from "../../ui/ControlF/ControlFMediator";

export class Actor extends Player implements InputListener {
    // ME 我自己
    readonly GameObject: Phaser.GameObjects.GameObject;
    protected mBag: Bag;
    // package: op_gameconfig.IPackage;
    protected mFriend: Friend;
    protected mInteractive: Interactive;
    private mRoom: IRoomService;
    private mPackage: op_gameconfig.IPackage;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mBlockable = false;
        // this.mRenderable = true; // Actor is always renderable!!!
        // this.addDisplay();
        this.mRoom = this.mElementManager.roomService;

        this.mRoom.world.inputManager.addListener(this);

        // if (this.mElementManager) {
        //     const roomService = this.mElementManager.roomService;
        //     if (roomService && roomService.cameraService) {
        //         roomService.cameraService.startFollow(this.mDisplay);
        //     }
        // }

        this.mFriend = new Friend(this.mRoom.world);
        this.mRoom.playerManager.set(this.id, this);
        this.mInteractive = new Interactive(mElementManager.roomService.world);
        this.mInteractive.register();
    }

    public getBag(): Bag {
        return this.mBag;
    }

    public getFriend(): Friend {
        return this.mFriend;
    }

    public getInteractive(): Interactive {
        return this.mInteractive;
    }

    // override super's method.
    public setRenderable(isRenderable: boolean): void {
        // do nothing!
        // Actor is always renderable!!!
    }

    public destroy() {
        if (this.mBag) {
            this.mBag.destroy();
            this.mBag = null;
        }
        this.mRoom.world.inputManager.removeListener(this);
        super.destroy();
    }

    downHandler(d: number, keyList: number[]) {
        if (!this.mDisplay) {
            return;
        }
        this.mRoom.playerManager.requestActorMove(d, keyList); // startActorMove();
    }

    upHandler() {
        // this.mRoom.playerManager.stopActorMove();
        if (!this.mDisplay) {
            return;
        }
        this.stopMove();
    }

    public startMove() {
        super.startMove();
        const med: ControlFMediator = this.mRoom.world.uiManager.getMediator(ControlFMediator.NAME) as ControlFMediator;
        if (med) med.hide();
    }

    public stopMove() {
        super.stopMove();
        if (this.mMoveData && this.mMoveData.destPos) {
            if (this.mMoveData.destPos) {
                // Logger.getInstance().debug("moveData:" + this.mMoveData.destPos.x + "," + this.mMoveData.destPos.y);
            } else {
                // Logger.getInstance().error("no destPos");
            }
            delete this.mMoveData.destPos;
            if (this.mMoveData.arrivalTime) this.mMoveData.arrivalTime = 0;
            if (this.mMoveData.tweenAnim) {
                this.mMoveData.tweenAnim.stop();
                this.mMoveData.tweenAnim.remove();
            }
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE = pkt.content;
        ct.nodeType = this.nodeType;
        const pos = this.getPosition();
        ct.spritePositions = {
            id: this.id,
            point3f: {
                x: pos.x,
                y: pos.y - this.offsetY,
                z: pos.z,
            },
            direction: this.dir
        };
        // Logger.getInstance().debug("nowPox:" + pos.x + "," + pos.y);
        this.mElementManager.connection.send(pkt);
    }

    public move(moveData: op_client.IMoveData) {
        // TODO 不能仅判断walk, 移动状态可能还有run
        if (this.mCurState !== PlayerState.WALK) {
            return;
        }
        super.move(moveData);
    }

    protected onMoveStart() {
    }

    protected onMoveComplete() {
        if (this.mCurState !== PlayerState.WALK) {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        this._doMove();
    }

    protected onMoving() {
        if (this.mCurState !== PlayerState.WALK) {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        super.onMoving();
    }

    protected addToBlock() {
        this.addDisplay();
    }

    set model(val: ISprite) {
        this.mModel = val;
        if (!val) {
            return;
        }
        if ((val as PlayerModel).package) {
            this.mPackage = (val as PlayerModel).package;
            this.mBag = new Bag(this.mElementManager.roomService.world);
            this.mBag.register();
        }
        this.load(this.mModel.displayInfo);
        if (this.mModel.pos) this.setPosition(this.mModel.pos);
        this.mDisplay.changeAlpha(this.mModel.alpha);
        if (this.mModel.nickname) this.mDisplay.showNickname(this.mModel.nickname);
        this.setDirection(this.mModel.direction);

        if (this.mElementManager) {
            const roomService = this.mElementManager.roomService;
            if (roomService && roomService.cameraService) {
                roomService.cameraService.startFollow(this.mDisplay);
            }
        }
    }

    get model(): ISprite {
        return this.mModel;
    }

    get package(): op_gameconfig.IPackage {
        return this.mPackage;
    }

    set package(value: op_gameconfig.IPackage) {
        this.mPackage = value;
    }
}
