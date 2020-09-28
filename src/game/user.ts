import { Player } from "../rooms/player/player";
import { IRoomService } from "../rooms/room";
import { InputListener } from "./input.service";
import { op_def, op_client, op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { PlayerModel } from "../rooms/player/player.model";
import { PlayerState } from "../rooms/element/element";
import { ISprite } from "../rooms/element/sprite";
import { PBpacket } from "net-socket-packet";
import { Bag } from "../rooms/player/bag/bag";
import { Friend } from "../rooms/player/friend/friend";
import { UserDataManager } from "../rooms/data/UserDataManager";
import { WorldService } from "./world.service";

export class User extends Player implements InputListener {
    private mUserData: UserDataManager;
    private mMoveStyle: number;
    constructor(world: WorldService) {
        super(undefined, undefined);
        this.mBlockable = false;
        this.mUserData = new UserDataManager(world);
    }

    addPackListener() {
        this.mUserData.addPackListener();
    }

    removePackListener() {
        this.mUserData.removePackListener();
    }

    enterScene(room: IRoomService, actor: op_client.IActor) {
        if (!room || !actor) {
            return;
        }
        this.mId = actor.id;
        this.mRoomService = room;
        this.mElementManager = room.playerManager;
        this.model = new PlayerModel(actor);

        if (room.world.inputManager) room.world.inputManager.addListener(this);
        this.mRoomService.playerManager.setMe(this);
        const roomService = this.mElementManager.roomService;
        if (roomService && roomService.cameraService) {
            const size = this.mElementManager.scene.scale;
            roomService.cameraService.setScroll(actor.x * roomService.world.scaleRatio - size.width / 2, actor.y * roomService.world.scaleRatio - size.height / 2);
            roomService.cameraService.syncCameraScroll();
        }
    }

    downHandler(d: number, keyList: number[]) {
        if (!this.mDisplay) {
            return;
        }
        this.startMove();
        if (!this.roomService.world.game.device.os.desktop) {
            // 按下键盘的时候已经发了一次了，如果再发一次后端会有问题
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
            const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
            content.keyCodes = keyList;
            this.mRoomService.connection.send(pkt);
        }
    }

    upHandler() {
        if (!this.mDisplay) {
            return;
        }
        this.stopMove();
    }

    public startMove() {
        super.startMove();
        // const med: ControlFMediator = this.mRoom.world.uiManager.getMediator(ControlFMediator.NAME) as ControlFMediator;
        // if (med) med.hide();
    }

    public stopMove() {
        super.stopMove();
        if (this.mRoomService && this.mRoomService.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
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
    }

    public move(moveData: op_client.IMoveData) {
        // TODO 不能仅判断walk, 移动状态可能还有run
        if (this.mRoomService.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            if (this.mCurState !== PlayerState.WALK) {
                return;
            }
        } else {
            this.startMove();
        }
        super.move(moveData);
    }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        if (this.mRoomService.world.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
            if (this.mCurState !== PlayerState.WALK) {
                return;
            }
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

    // override super's method.
    public setRenderable(isRenderable: boolean): void {
        // do nothing!
        // Actor is always renderable!!!
    }

    public getBag(): Bag {
        return undefined;
    }

    public getFriend(): Friend {
        return undefined;
    }

    public clear() {
        this.removePackListener();
        super.clear();
        if (this.mUserData) this.userData.destroy();
        this.destroy();
    }

    protected onMoveComplete() {
        this.preMoveComplete();
        if (this.mCurState !== PlayerState.WALK) {
            this.mMoveData.tweenAnim.stop();
            return;
        }
        if (this.mRoomService.world.moveStyle !== op_def.MoveStyle.DIRECTION_MOVE_STYLE) {
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
            // this.mPackage = (val as PlayerModel).package;
            // this.mBag = new Bag(this.mElementManager.roomService.world);
            // this.mBag.register();
        }
        this.load(this.mModel.displayInfo);
        if (this.mModel.pos) this.setPosition(this.mModel.pos);
        this.mDisplay.changeAlpha(this.mModel.alpha);
        if (this.mModel.nickname) this.showNickname();
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
        return undefined;
    }

    set package(value: op_gameconfig.IPackage) {
        // this.mPackage = value;
    }

    get moveData() {
        return this.mMoveData;
    }

    get userData() {
        return this.mUserData;
    }

    set moveStyle(val: number) {
        this.mMoveStyle = val;
    }

    get moveStyle() {
        return this.mMoveStyle;
    }
}
