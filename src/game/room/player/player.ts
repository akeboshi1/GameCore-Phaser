import { op_def } from "pixelpai_proto";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { IElementManager } from "../element/element.manager";
import { ISprite, PlayerState } from "structure";
import { IPos } from "../../../utils/logic.pos";
import { Element, IElement, InputEnable, MovePath } from "../element/element";
import {DirectionChecker, Logger} from "utils";
export class Player extends Element implements IElement {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    protected mOffsetY: number = undefined;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.setInputEnable(InputEnable.Enable);
    }

    async setModel(val: ISprite): Promise<any> {
        (<any>val).off("Animation_Change", this.animationChanged, this);
        (<any>val).on("Animation_Change", this.animationChanged, this);
        return super.setModel(val);
    }

    public changeState(val?: string, times?: number) {
        Logger.getInstance().debug("change state: ", val);
        if (this.mCurState === val) return;
        // if (!val) val = PlayerState.IDLE;
        if (!val) {
            val = PlayerState.IDLE;
        }
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            // this.mModel.currentAnimationName = this.mCurState;
            this.mModel.setAnimationName(this.mCurState, times);
            const id = this.mModel.id;
            this.mElementManager.roomService.game.renderPeer.playAnimation(id, this.mModel.currentAnimation, undefined, times);
            // (this.mDisplay as BaseDragonbonesDisplay).play(this.mModel.currentAnimation);
        }
    }

    public setPosition(pos: IPos) {
        // pos.y += this.offsetY;
        super.setPosition(pos);
    }

    public completeMove() {
        this.onMovePathPointComplete(this.mMoveData.onCompleteParams);
        this.mMovePathPointFinished(this.mMoveData.onCompleteParams);
    }
    public setWeapon(weaponid: string) {
        if (!this.mModel || !this.mModel.avatar) return;
        const avatar: any = { farmWeapId: weaponid, barmWeapId: weaponid };
        this.model.setTempAvatar(avatar);
        this.load(this.mModel.displayInfo);
    }

    public removeWeapon() {
        if (!this.mModel) return;
        if (this.mModel.suits) {
            this.mModel.updateAvatarSuits(this.mModel.suits);
            this.model.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        } else if (this.mModel.avatar) {
            this.model.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        }

    }

    protected async checkDirection() {
        const pos = this.moveControll.position;
        const prePos = this.moveControll.prePosition;
        // Logger.getInstance().debug("#dir startMove checkDir", this.id, pos, prePos);
        const dir = DirectionChecker.check(prePos, pos);
        this.setDirection(dir);
    }

    // protected onMoveStart() {
    //     this.changeState(PlayerState.WALK);
    //     if (this.mMoveData) {
    //         this.mMoveData.step = 0;
    //     }
    //     super.onMoveStart();
    // }

    // protected onMoveComplete() {
    //     this.preMoveComplete();
    //     super.onMoveComplete();
    //     this.changeState(PlayerState.IDLE);
    // }

    protected preMoveComplete() {
        if (this.mMoveData && this.mMoveData.posPath) {
            const complete = this.mMoveData.onCompleteParams;
            if (complete) {
                this.mMovePathPointFinished(this.mMoveData.onCompleteParams);
                // complete.call(this, this.mMoveData.onCompleteParams);
                delete this.mMoveData.onCompleteParams;
            }
        }
    }

    protected onMovePathPointComplete(params) {
        if (!this.mMoveData) {
            return;
        }
        this.mMoveData.step += 1;
        // if (!this.mMoveData.posPath) {
        //     return;
        // }
        // const posPath = this.mMoveData.posPath;
        // posPath.shift();
    }

    protected mMovePathPointFinished(path: MovePath) {
        if (!path || !this.mRoomService) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_PATH_POINT_FINISHED);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_PATH_POINT_FINISHED = pkt.content;
        const currentPoint = op_def.PBPoint3f.create();
        const pos = this.getPosition();
        currentPoint.x = pos.x;
        currentPoint.y = pos.y;
        currentPoint.z = pos.z;

        const targetPoint = op_def.PBPoint3f.create();
        targetPoint.x = path.x;
        targetPoint.y = path.y;
        content.currentPoint = currentPoint;
        content.lastTargetPoint = targetPoint;
        content.timestemp = this.mRoomService.game.clock.unixTime;
        this.mRoomService.game.peer.send(pkt.Serialization());
    }

    protected get offsetY(): number {
        if (this.mOffsetY === undefined) {
            if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
                return 0;
            }
            // this.mOffsetY = 0;
            this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
        }
        return this.mOffsetY;
    }

    protected addBody() {
        // this._sensor = true;
        // this._offsetOrigin.y = 0;
        // super.addBody();
        // this.setBody();
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }

    private animationChanged(data: any) {
        // { id: this.id, direction: this.direction }
        this.mElementManager.roomService.game.renderPeer.displayAnimationChange(data);
    }
}
