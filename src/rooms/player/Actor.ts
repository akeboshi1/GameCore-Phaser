import { IElementManager, ISprite, PlayerState, MoveData } from "../element";
import { IRoomService } from "../room";
import { InputListener } from "../../game/input.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_gameconfig, op_def } from "pixelpai_proto";
import { Player } from "./player";
import { Bag } from "./bag/bag";
import { Interactive } from "./interactive/interactive";
import { Friend } from "./friend/friend";
import { PlayerModel } from "./player.model";
// import { ControlFMediator } from "../../ui/ControlF/ControlFMediator";

export class Actor extends Player implements InputListener {
    // ME 我自己
    readonly GameObject: Phaser.GameObjects.GameObject;
    protected mBag: Bag;
    // package: op_gameconfig.IPackage;
    protected mFriend: Friend;
    protected mInteractive: Interactive;
    private mRoom: IRoomService;
    private mPackage: op_gameconfig.IPackage;
    private mMoveTime: number;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mBlockable = false;
        // this.mRenderable = true; // Actor is always renderable!!!
        // this.addDisplay();
        this.mRoom = this.mElementManager.roomService;

        if (this.mRoom.world.inputManager) this.mRoom.world.inputManager.addListener(this);

        // if (this.mElementManager) {
        //     const roomService = this.mElementManager.roomService;
        //     if (roomService && roomService.cameraService) {
        //         roomService.cameraService.startFollow(this.getDisplay());
        //         roomService.cameraService.syncCameraScroll();
        //     }
        // }
        if (this.mElementManager) {
            const roomService = this.mElementManager.roomService;
            if (roomService && roomService.cameraService) {
                const pos = sprite.pos;
                const size = this.mElementManager.scene.scale;
                roomService.cameraService.setScroll(pos.x * roomService.world.scaleRatio - size.width / 2, pos.y * roomService.world.scaleRatio - size.height / 2);
                roomService.cameraService.syncCameraScroll();
            }
        }

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
        if (this.mRoom.world.inputManager) this.mRoom.world.inputManager.removeListener(this);
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
        // TODO modular
        // const med: ControlFMediator = this.mRoom.world.uiManager.getMediator(ControlFMediator.NAME) as ControlFMediator;
        // if (med) med.hide();
    }

    public stopMove() {
        super.stopMove();
        if (this.mRoom && this.mRoom.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
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
            // Logger.getInstance().debug("nowPox:" + pos.x + "," + pos.y);
            this.mElementManager.connection.send(pkt);
        }
    }

    public move(moveData: op_client.IMoveData) {
        // TODO 不能仅判断walk, 移动状态可能还有run
        if (this.mRoom.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            if (this.mCurState !== PlayerState.WALK) {
                return;
            }
        } else {
            this.startMove();
        }
        super.move(moveData);
    }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        if (this.mRoom.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            if (this.mCurState !== PlayerState.WALK) {
                return;
            }
        } else {
            this.startMove();
        }
        // movePath.path = [{ x: 885.000000, y: 637.50000}, { x: 915.000000, y: 637.50000}, { x: 945.000000, y: 637.50000}, { x: 975.000000, y: 637.50000}, { x: 1005.00000, y: 637.50000}, { x: 1035.00000, y: 637.50000}, { x: 1065.00000, y: 637.50000}, { x: 1080.00000, y: 645.00000}, { x: 1095.00000, y: 652.50000}, { x: 1110.00000, y: 660.00000}, { x: 1125.00000, y: 667.50000}, { x: 1140.00000, y: 675.00000}, { x: 1155.00000, y: 682.50000}, { x: 1170.00000, y: 690.00000}];
        // movePath.path = [{x: 1140.00000, y: 495.000000}, {x: 1125.00000, y: 502.500000}, {x: 1110.00000, y: 510.000000}, {x: 1095.00000, y: 517.500000}, {x: 1080.00000, y: 525.000000}, {x: 1065.00000, y: 532.500000}, {x: 1050.00000, y: 540.000000}, {x: 1035.00000, y: 547.500000}];
        // movePath.timestemp = 3965;
        const path = movePath.path;
        let now = this.mElementManager.roomService.now();
        let duration = 0;
        const pathAry = path.map((value) => {
            now += duration;
            duration = value.timestemp - now;
            return {
                x: value.point3f.x, y: value.point3f.y, duration, timestemp: value.timestemp
            };
        });
        // this.drawPath(movePath.path);
        super.movePath(movePath);
    }

    protected onMoveComplete() {
        this.preMoveComplete();
        if (this.mCurState !== PlayerState.WALK) {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        if (this.mRoom.world.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            this.changeState(PlayerState.IDLE);
            this.stopMove();
        }
        this._doMove();
    }

    protected onMoving() {
        if (this.mCurState !== PlayerState.WALK) {
            this.mMoveData.tweenLineAnim.stop();
            return;
        }
        super.onMoving();
    }

    protected addToBlock() {
        this.addDisplay();
    }

    private drawPath(pos: op_client.IMovePoint[]) {
        // if (!pos && pos.length > 0) {
        //     return;
        // }
        // if (!this.mMovePath) {
        //     this.mMovePath = this.mElementManager.scene.make.graphics(undefined, false);
        // }
        // this.mMovePath.clear();
        // this.mMovePath.lineStyle(2, 0xFFFF00);
        // this.mMovePath.moveTo(pos[0].point3f.x, pos[0].point3f.y);
        // let point3f = null;
        // for (const point of pos) {
        //     point3f = point.point3f;
        //     if (point3f) this.mMovePath.lineTo(point3f.x, point3f.y);
        // }
        // this.mMovePath.strokePath();
        // this.mRoom.addToSurface(<any> this.mMovePath);
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

        // if (this.mElementManager) {
        //     const roomService = this.mElementManager.roomService;
        //     if (roomService && roomService.cameraService) {
        //         roomService.cameraService.startFollow(this.mDisplay);
        //     }
        // }
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

    set moveTime(val: number) {
        this.mMoveTime = val;
    }

    get moveData(): MoveData {
        return this.mMoveData;
    }
}
