import { op_def } from "pixelpai_proto";
import { IElementManager } from "../element/element.manager";
import { IDragonbonesModel, ISprite, PlayerState } from "structure";
import { IPos } from "../../../utils/logic.pos";
import { Element, IElement, InputEnable } from "../element/element";
import { DirectionChecker } from "utils";
import { LayerEnum } from "game-capsule";
export class Player extends Element implements IElement {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    protected mOffsetY: number = undefined;

    constructor(game, sprite: ISprite, mElementManager: IElementManager) {
        super(game, sprite, mElementManager);
        this.setInputEnable(InputEnable.Enable);
    }

    async setModel(model: ISprite): Promise<any> {
        if (!model) {
            return;
        }
        (<any>model).off("Animation_Change", this.animationChanged, this);
        (<any>model).on("Animation_Change", this.animationChanged, this);
        if (!model.layer) {
            model.layer = LayerEnum.Surface;
        }
        this.removeFromWalkableMap();
        this.mModel = model;
        this.mQueueAnimations = undefined;
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        const area = model.getCollisionArea();
        const obj = {
            id: model.id,
            pos: model.pos,
            alpha: model.alpha,
            nickname: model.nickname,
            titleMask: model.titleMask | 0x00010000,
            hasInteractive: true
        };
        // render action
        this.load(this.mModel.displayInfo)
            .then(() => this.mElementManager.roomService.game.renderPeer.setPlayerModel(obj))
            .then(() => {
                this.setDirection(this.mModel.direction);
                if (this.mInputEnable === InputEnable.Interactive) {
                    this.setInputEnable(this.mInputEnable);
                }
                if (model.mountSprites && model.mountSprites.length > 0) {
                    this.updateMounth(model.mountSprites);
                }
                this.addToWalkableMap();
                return this.setRenderable(true);
            });
    }

    public async load(displayInfo: IDragonbonesModel, isUser: boolean = false): Promise<any> {
        this.mDisplayInfo = displayInfo;
        this.isUser = isUser;
        if (!displayInfo) return Promise.reject(`element ${this.mModel.nickname} ${this.id} display does not exist`);
        await this.loadDisplayInfo();
        return this.addToBlock();
    }

    public changeState(val?: string, times?: number) {
        if (this.mCurState === val) return;
        if (!val) {
            val = PlayerState.IDLE;
        }
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            this.mModel.setAnimationName(this.mCurState, times);
            const id = this.mModel.id;
            this.mElementManager.roomService.game.renderPeer.playAnimation(id, this.mModel.currentAnimation, undefined, times);
        }
    }

    public stopMove(points?: any) {
        this.mMoving = false;
        this.moveControll.setVelocity(0, 0);
        this.changeState(PlayerState.IDLE);
    }

    public completeMove() {
    }

    public setWeapon(weaponid: string) {
        if (!this.mModel || !this.mModel.avatar) return;
        const avatar: any = { barmWeapId: { sn: weaponid, slot: "NDE5NDMwNA==", suit_type: "weapon" } };
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

    // Player 和 User不需要参与碰撞
    public addToWalkableMap() {
    }

    public removeFromWalkableMap() {
    }

    public calcDirection(pos: IPos, target: IPos) {
        const dir = DirectionChecker.check(pos, target);
        this.setDirection(dir);
    }

    protected checkDirection() {
        const pos = this.moveControll.position;
        const prePos = this.moveControll.prePosition;
        const dir = DirectionChecker.check(prePos, pos);
        this.setDirection(dir);
    }

    protected get offsetY(): number {
        if (this.mOffsetY === undefined) {
            if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
                return 0;
            }
            this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
        }
        return this.mOffsetY;
    }

    protected addBody() {
    }

    protected drawBody() {
        super.drawBody();
        const size = this.mRoomService.miniSize;
        this.moveControll.setBodiesOffset({ x: 0, y: -size.tileHeight * 0.5 });
    }

    private mCheckStateHandle(val: string): boolean {
        return true;
    }
}
