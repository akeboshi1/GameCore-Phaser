import { LayerEnum } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import {
    AnimationQueue,
    AvatarSuitType,
    ElementStateType,
    IDragonbonesModel,
    IFramesModel,
    IProjection,
    ISprite,
    PlayerState, DirectionChecker, IPos, Logger, LogicPos
} from "structure";
import { Tool } from "utils";
import { BlockObject } from "../block/block.object";
import { IElementManager } from "./element.manager";
import { BaseStateManager } from "../state";
import { IRoomService } from "../../room/room";
import { InputEnable } from "./input.enable";
import { IChangeAnimation } from "src/structure/animation";

export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;
    readonly created: boolean;
    readonly moving: boolean;

    readonly moveData: MoveData;

    nodeType: number;

    state: boolean;

    model: ISprite;

    update(time?: number, delta?: number);

    startFireMove(pos: IPos);

    startMove();

    stopMove();

    setModel(model: ISprite);

    updateModel(model: op_client.ISprite, patchKey: string[]);

    play(animationName: string): void;

    setPosition(p: IPos, syncPos?: boolean): void;

    getPosition(): IPos;

    getPosition45(): IPos;

    setDirection(val: number): void;

    getDirection(): number;

    showEffected(displayInfo: IFramesModel);

    showNickname();

    hideNickname();

    showRefernceArea(conflictMap?: number[][], freeColor?: number, conflictColor?: number);

    hideRefernceArea();

    turn();

    setAlpha(val: number);

    setQueue(queue: op_client.IChangeAnimation[], finishAnimationBehavior?: number);

    completeAnimationQueue();

    mount(ele: IElement): this;

    unmount(targetPos?: IPos): Promise<this>;

    addMount(ele: IElement, index?: number): this;

    removeMount(ele: IElement, targetPos?: IPos): Promise<void>;

    getInteractivePositionList(): IPos[];

    getProjectionSize(): IProjection;

    addToMap();

    removeFromMap();

    addToWalkableMap();

    removeFromWalkableMap();

    addToInteractiveMap();

    removeFromInteractiveMap();

    destroy();
}

export interface MoveData {
    step?: number;
    path?: op_def.IMovePoint[];
    arrivalTime?: number;
    targetId?: number;
}
export class Element extends BlockObject implements IElement {
    get state(): boolean {
        return this.mState;
    }

    set state(val: boolean) {
        this.mState = val;
    }

    get dir(): number {
        return (this.mDisplayInfo && this.mDisplayInfo.avatarDir !== undefined) ? this.mDisplayInfo.avatarDir : 3;
    }

    get roomService(): IRoomService {
        return this.mRoomService;
    }

    get id(): number {
        return this.mId;
    }

    get model(): ISprite {
        return this.mModel;
    }

    set model(val: ISprite) {
        this.setModel(val);
    }

    get moveData(): MoveData {
        return this.mMoveData;
    }

    get created() {
        return this.mCreatedDisplay;
    }

    get eleMgr(): IElementManager {
        if (this.mElementManager) {
            return this.mElementManager;
        }
    }

    get moving() {
        return this.mMoving;
    }

    get nodeType(): number {
        return op_def.NodeType.ElementNodeType;
    }

    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mAnimationName: string = "";
    protected mMoveData: MoveData = {};
    protected mCurState: string = PlayerState.IDLE;
    protected mOffsetY: number = undefined;
    protected mQueueAnimations: AnimationQueue[];
    protected mMoving: boolean = false;
    protected mRootMount: IElement;
    protected mMounts: IElement[];
    protected mDirty: boolean = false;
    protected mCreatedDisplay: boolean = false;
    protected isUser: boolean = false;
    protected mStateManager: BaseStateManager;
    protected mTopDisplay: any;
    // 移动
    protected readonly mMoveDelayTime: number = 400;
    protected mMoveTime: number = 0;
    protected readonly mMoveSyncDelay = 200;
    protected mMoveSyncTime: number = 0;
    protected mMovePoints: any[];
    protected mTarget;
    private delayTime = 1000 / 45;
    private mState: boolean = false;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite ? sprite.id : -1, mElementManager ? mElementManager.roomService : undefined);
        if (!sprite) {
            return;
        }
        this.mId = sprite.id;
        this.model = sprite;
    }

    showEffected(displayInfo: any) {
        throw new Error("Method not implemented.");
    }

    moveMotion(x: number, y: number) {
        if (this.mRootMount) {
            this.mRootMount.removeMount(this, { x, y });
        }
        this.mMoveData = { path: [{ pos: new LogicPos(x, y) }] };
        this.moveControll.setIgnoreCollsion(false);
        this.startMove();
    }

    public async load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false): Promise<any> {
        this.mDisplayInfo = displayInfo;
        this.isUser = isUser;
        if (!displayInfo) return Promise.reject(`element ${this.mModel.nickname} ${this.id} display does not exist`);
        return this.addToBlock();
    }

    public async setModel(model: ISprite) {
        if (!model) {
            return;
        }
        (<any>model).off("Animation_Change", this.animationChanged, this);
        (<any>model).on("Animation_Change", this.animationChanged, this);
        if (!model.layer) {
            model.layer = LayerEnum.Surface;
            Logger.getInstance().warn(`${Element.name}: sprite layer is empty`);
        }
        this.removeFromMap();
        this.mModel = model;
        this.mQueueAnimations = undefined;
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        const obj = { id: model.id, pos: model.pos, nickname: model.nickname, nodeType: model.nodeType, sound: model.sound, alpha: model.alpha, titleMask: model.titleMask | 0x00020000, attrs: model.attrs, hasInteractive: model.hasInteractive };
        this.mElementManager.roomService.game.peer.render.setModel(obj);
        if (!model.displayInfo) {
            Logger.getInstance().warn(`${Element.name}: sprite displayInfo is empty`);
            return;
        }
        // 必须执行一遍下面的方法，否则无法获取碰撞区域
        const area = model.getCollisionArea();
        this.addToMap();
        // render action
        this.load(this.mModel.displayInfo)
            .then(() => {
                this.setDirection(this.mModel.direction);
                if (this.mInputEnable === InputEnable.Interactive) {
                    this.setInputEnable(this.mInputEnable);
                }
                if (model.mountSprites && model.mountSprites.length > 0) {
                    this.updateMounth(model.mountSprites);
                }
                return this.setRenderable(true);
            })
            .catch((error) => {
                Logger.getInstance().error(error);
                this.mRoomService.elementManager.onDisplayReady(this.mModel.id);
            });
    }

    public updateModel(model: op_client.ISprite, patchKeys: string[], avatarType?: op_def.AvatarStyle) {
        if (this.mModel.id !== model.id) {
            return;
        }
        this.removeFromMap();
        // direction  nickname  display_badge_cards  point3f  attrs  current_animation_name  opacity  animations  speed  mount_sprites
        for (const key of patchKeys) {
            // TODO 考虑使用反射
            switch (key) {
                case "direction":
                    this.setDirection(model.direction);
                    break;
                case "nickname":
                    this.mModel.nickname = model.nickname;
                    this.showNickname();
                    break;
                case "point3f":
                    const point3f = model.point3f;
                    this.setPosition(new LogicPos(point3f.x, point3f.y, point3f.z));
                    break;
                case "attrs":
                    this.mModel.updateAttr(model.attrs);
                    break;
                case "speed":
                    this.mModel.speed = model.speed;
                    // 速度改变，重新计算
                    if (this.mMoving) this.startMove();
                    break;
                case "current_animation_name":
                    this.play(model.currentAnimationName);
                    this.setInputEnable(this.mInputEnable);
                    this.mModel.setAnimationQueue(undefined);
                    break;
                case "mount_sprites":
                    const mounts = model.mountSprites;
                    this.mergeMounth(mounts);
                    this.updateMounth(mounts);
                    break;
                case "animations":
                    if (!model.animations) {
                        Logger.getInstance().error(`${model.nickname}-${model.id} animation does not exist`);
                        break;
                    }
                    if (!model.display) {
                        Logger.getInstance().error(`${model.nickname}-${model.id} display does not exist`);
                        break;
                    }
                    this.mModel.updateDisplay(model.display, model.animations);
                    this.load(this.mModel.displayInfo);
                    this.mElementManager.roomService.game.renderPeer.setHasInteractive(this.id, this.mModel.hasInteractive);
                    break;
            }
        }
        if (!this.mModel.sn) {
            // tslint:disable-next-line:no-console
            // console.log("update model sn", model);
            this.mModel.sn = model.sn;
        }
        // if (model.hasOwnProperty("attrs")) {
        //     this.mModel.updateAttr(model.attrs);
        // }
        let reload = false;
        if (avatarType === op_def.AvatarStyle.SuitType) {
            if (this.mModel.updateSuits) {
                this.mModel.updateAvatarSuits(this.mModel.suits);
                if (!this.mModel.avatar) this.mModel.avatar = AvatarSuitType.createBaseAvatar();
                this.mModel.updateAvatar(this.mModel.avatar);
                reload = true;
            }
        } else if (avatarType === op_def.AvatarStyle.OriginAvatar) {
            if (model.hasOwnProperty("avatar")) {
                this.mModel.updateAvatar(model.avatar);
                reload = true;
            }
        }

        if (model.display && model.animations) {
            this.mModel.updateDisplay(model.display, model.animations);
            reload = true;
        }
        
        if (reload) this.load(this.mModel.displayInfo);
        this.addToMap();
    }

    public play(animationName: string, times?: number): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Element.name}: sprite is empty`);
            return;
        }
        // const preWalkable = this.mModel.getWalkableArea();
        this.removeFromMap();
        this.mModel.setAnimationName(animationName, times);
        // const nextWalkable = this.mModel.getWalkableArea();
        const hasInteractive = this.model.hasInteractive;
        if (this.mInputEnable) this.setInputEnable(this.mInputEnable);
        this.addToMap();
        if (this.mRoomService) {
            if (!this.mRootMount) {
                if (times === undefined) {
                    // this.mRoomService.game.physicalPeer.changeAnimation(this.id, this.mModel.currentAnimation.name);
                } else {
                    // this.mRoomService.game.physicalPeer.changeAnimation(this.id, this.mModel.currentAnimation.name, times);
                }
                this.addBody();
            }
            this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation, undefined, times);
            this.mRoomService.game.renderPeer.setHasInteractive(this.id, hasInteractive);
        }
    }

    public setQueue(animations: op_client.IChangeAnimation[], finishAnimationBehavior?: number) {
        if (!this.mModel) {
            return;
        }
        if (animations.length < 1) return;
        const changeAnimation: IChangeAnimation[] = [];
        for (const animation of animations) {
            const aq: IChangeAnimation = {
                name: animation.animationName,
                playTimes: animation.times,
            };
            changeAnimation.push(aq);
        }
        const lastAni = changeAnimation[changeAnimation.length - 1];
        if (lastAni.playTimes && lastAni.playTimes > 0) {
            // finishAnimationBehavior -1 回到之前的动画， 0 停在当前
            if (finishAnimationBehavior === -1) {
                const currentAnimation = this.mModel.currentAnimation;
                if (this.mMoving) {
                    changeAnimation.push();
                } else {
                    changeAnimation.push({ name: currentAnimation.name, playTimes: currentAnimation.times });
                }
            }
        }
        this.mModel.setAnimationQueue({ changeAnimation });
        this.play(animations[0].animationName, animations[0].times);
    }

    public completeAnimationQueue() {
        const animationQueue = this.model.animationQueue;
        if (!animationQueue) {
            this.play(this.mCurState);
            Logger.getInstance().error("Animation queue does not exist");
            return;
        }
        const anis = animationQueue.changeAnimation;
        if (!anis) return;
        anis.shift();
        const tmpAni = anis[0];
        if (!tmpAni) return;
        this.play(tmpAni.name, tmpAni.playTimes);
    }

    public setDirection(val: number) {
        if (!this.mModel) {
            return;
        }
        if (this.mDisplayInfo) {
            this.mDisplayInfo.avatarDir = val;
        }
        if (this.mModel.direction === val) {
            return;
        }
        if (this.model && !this.model.currentAnimationName) {
            this.model.currentAnimationName = PlayerState.IDLE;
        }
        if (this.model) {
            this.model.setDirection(val);
        }
        if (this.mMounts) {
            for (const mount of this.mMounts) {
                mount.setDirection(val);
            }
        }
        // this.play(this.model.currentAnimationName);
    }

    public getDirection(): number {
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    }

    public changeState(val?: string) {
        if (this.mCurState === val) return;
        if (!val) {
            val = PlayerState.IDLE;
        }
        this.mCurState = val;
        this.play(this.mCurState);
    }

    public getState(): string {
        return this.mCurState;
    }

    public getRenderable(): boolean {
        return this.mRenderable;
    }

    public syncPosition() {
        const userPos = this.getPosition();
        const pos = op_def.PBPoint3f.create();
        pos.x = userPos.x;
        pos.y = userPos.y;
        const movePoint = op_def.MovePoint.create();
        movePoint.pos = pos;
        // 给每个同步点时间戳
        movePoint.timestamp = Date.now();
        if (!this.mMovePoints) this.mMovePoints = [];
        this.mMovePoints.push(movePoint);
    }

    public update(time?: number, delta?: number) {
        if (this.mMoving === false) return;
        this._doMove(time, delta);
        this.mDirty = false;
        // 如果主角没有在推箱子，直接跳过
        if (!this.mRoomService.playerManager.actor.stopBoxMove) return;
        const now = Date.now();
        this.mMoveSyncTime += delta;
        if (this.mMoveSyncTime >= this.mMoveSyncDelay) {
            this.mMoveSyncTime = 0;
            this.syncPosition();
        }
        if (!this.mMovePoints || this.mMovePoints.length < 1) {
            this.mMoveTime = now;
            return;
        }
        if (now - this.mMoveTime > this.mMoveDelayTime) {
            const movePath = op_def.MovePath.create();
            movePath.id = this.id;
            movePath.movePos = this.mMovePoints;
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE = packet.content;
            content.movePath = movePath;
            this.mRoomService.game.connection.send(packet);
            this.mMovePoints.length = 0;
            this.mMovePoints = [];
            this.mMoveTime = now;
        }
    }

    /**
     * 发射
     * id 发射对象
     * pos 发射终点
     */
    public fire(id: number, pos: IPos) {
        // 没有挂载物
        if (!this.mMounts) return;
        const len = this.mMounts.length;
        for (let i: number = 0; i < len; i++) {
            const mount = this.mMounts[i];
            if (mount && mount.id === id) {
                mount.startFireMove(pos);
                break;
            }
        }
    }

    public async startFireMove(pos: IPos) {
        if (this.mTarget) {
            await this.removeMount(this.mTarget);
            this.mRoomService.game.renderPeer.startFireMove(this.mTarget.id, pos);
            this.mTarget = null;
        }
    }

    public move(path: op_def.IMovePoint[]) {
        if (!this.mElementManager) {
            return;
        }
        this.mMoveData.path = path;
        // this.mRoomService.game.physicalPeer.move(this.id, this.mMoveData.path);
        this.startMove();
    }

    public startMove(points?: any) {
        if (points && this.mRoomService.playerManager.actor.stopBoxMove) {
            this._startMove(points);
            return;
        }
        if (!this.mMoveData) {
            return;
        }
        const path = this.mMoveData.path;
        if (!path || path.length < 1) {
            return;
        }
        this.mMoving = true;
        if (!this.moveControll) {
            return;
        }
        const pos = this.moveControll.position;
        const pathData = path[0];
        const pathPos = pathData.pos;
        const angle = Math.atan2(pathPos.y - pos.y, pathPos.x - pos.x);
        const speed = this.mModel.speed * this.delayTime;
        this.moveControll.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        const dir = DirectionChecker.check(pos, pathPos);

        this.setDirection(dir);
        this.changeState(PlayerState.WALK);
    }

    public stopMove(stopPos?: any) {
        if (!this.mMovePoints) this.mMovePoints = [];
        this.mMoving = false;
        this.moveControll.setVelocity(0, 0);
        this.changeState(PlayerState.IDLE);
        // 如果主角没有在推箱子，直接跳过
        if (!this.mRoomService.playerManager.actor.stopBoxMove) return;
        this.mMovePoints = [];
        this.mRoomService.playerManager.actor.stopBoxMove = false;
    }

    public getPosition(): IPos {
        let pos: IPos;
        const p = super.getPosition();
        // if (this.mRootMount) {
        // mount后未更新Position。加上RootMount会偏移
        //     pos = this.mRootMount.getPosition();
        //     pos.x += p.x;
        //     pos.y += p.y;
        //     pos.z += p.z;
        // } else {
        pos = new LogicPos(p.x, p.y, p.z);
        // }
        return pos;
    }

    public setPosition(p: IPos, syncPos: boolean = false) {
        if (!this.mElementManager) {
            return;
        }
        if (p) {
            this.mModel.setPosition(p.x, p.y);
            if (this.moveControll) this.moveControll.setPosition(this.mModel.pos);
        }
    }

    public getRootPosition(): IPos {
        return this.mModel.pos;
    }

    public showBubble(text: op_def.IStrMsg, setting: op_client.IChat_Setting) {
        this.mRoomService.game.renderPeer.showBubble(this.id, text, setting);
    }

    public clearBubble() {
        this.mRoomService.game.renderPeer.clearBubble(this.id);
    }

    public showNickname() {
        if (!this.mModel) return;
        this.mRoomService.game.renderPeer.showNickname(this.id, this.mModel.nickname);
    }

    public hideNickname() {
        // this.removeFollowObject(FollowEnum.Nickname);
    }

    public showTopDisplay(data?: ElementStateType) {
        this.mTopDisplay = data;
        if (this.mCreatedDisplay) this.mRoomService.game.renderPeer.showTopDisplay(this.id, data);
    }

    public removeTopDisplay() {
        if (this.mCreatedDisplay) this.mRoomService.game.renderPeer.removeTopDisplay(this.id);
    }

    public showRefernceArea(conflictMap?: number[][], freeColor?: number, conflictColor?: number) {
        const area = this.mModel.getCollisionArea();
        const origin = this.mModel.getOriginPoint();
        if (!area || !origin) return;
        this.mRoomService.game.renderPeer.showRefernceArea(this.id, area, origin, conflictMap, freeColor, conflictColor);
    }

    public hideRefernceArea() {
        this.mRoomService.game.renderPeer.hideRefernceArea(this.id);
    }

    /**
     * 获取元素交互点列表
     */
    public getInteractivePositionList(): IPos[] {
        const interactives = this.mModel.getInteractive();
        if (!interactives || interactives.length < 1) {
            return;
        }
        const pos45 = this.mRoomService.transformToMini45(this.getPosition());
        const result: IPos[] = [];
        for (const interactive of interactives) {
            if (this.mRoomService.isWalkable(pos45.x + interactive.x, pos45.y + interactive.y)) {
                result.push(this.mRoomService.transformToMini90(new LogicPos(pos45.x + interactive.x, pos45.y + interactive.y)));
            }
        }
        return result;
    }

    public getAttr(key: string) {
        return this.mModel.getAttr(key);
    }

    get nickname(): string {
        return this.mModel.nickname;
    }

    public turn(): void {
        if (!this.mModel) {
            return;
        }
        this.mModel.turn();
        this.play(this.model.currentAnimationName);
    }

    public setAlpha(val: number) {
        this.roomService.game.renderPeer.changeAlpha(this.id, val);
    }

    public mount(root: IElement) {
        this.mRootMount = root;
        if (this.mMoving) {
            this.stopMove();
        }
        this.mDirty = true;
        this.removeFromMap();
        this.removeBody();
        return this;
    }

    public async unmount(): Promise<this> {
        if (this.mRootMount) {
            const pos = this.mRootMount.getPosition();
            this.mRootMount = null;
            this.setPosition(pos, true);
            this.addToMap();
            this.addBody();
            await this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y);
            this.mDirty = true;
        }
        return this;
    }

    public addMount(ele: IElement, index: number) {
        if (!this.mMounts) this.mMounts = [];
        ele.mount(this);
        this.mRoomService.game.renderPeer.mount(this.id, ele.id, index);
        if (this.mMounts.indexOf(ele) === -1) {
            this.mMounts.push(ele);
        }
        return this;
    }

    public async removeMount(ele: IElement, targetPos?: IPos) {
        const index = this.mMounts.indexOf(ele);
        if (index === -1) {
            return Promise.resolve();
        }
        this.mMounts.splice(index, 1);
        await ele.unmount(targetPos);
        if (!this.mMounts) return Promise.resolve();
        this.mRoomService.game.renderPeer.unmount(this.id, ele.id, ele.getPosition());
        return Promise.resolve();
    }

    public getDepth() {
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        return depth;
    }

    public asociate() {
        const model = this.mModel;
        if (model.mountSprites && model.mountSprites.length > 0) {
            this.updateMounth(model.mountSprites);
        }
    }

    public addToMap() {
        this.addToWalkableMap();
        this.addToInteractiveMap();
    }

    public removeFromMap() {
        this.removeFromWalkableMap();
        this.removeFromInteractiveMap();
    }

    public addToWalkableMap() {
        if (this.mRootMount) return;
        if (this.model && this.mElementManager) this.mElementManager.roomService.addToWalkableMap(this.model);
    }

    public removeFromWalkableMap() {
        if (this.model && this.mElementManager) this.mElementManager.roomService.removeFromWalkableMap(this.model);
    }

    public addToInteractiveMap() {
        // 有叠加物件时，不做添加处理
        if (this.mRootMount) return;
        if (this.model && this.mElementManager) this.mElementManager.roomService.addToInteractiveMap(this.model);
    }

    public removeFromInteractiveMap() {
        if (this.model && this.mElementManager) this.mElementManager.roomService.removeFromInteractiveMap(this.model);
    }

    public setState(stateGroup: op_client.IStateGroup) {
        if (!this.mStateManager) this.mStateManager = new BaseStateManager(this.mRoomService);
        this.mStateManager.setState(stateGroup);
    }

    public destroy() {
        this.mCreatedDisplay = false;
        if (this.mMoveData && this.mMoveData.path) {
            this.mMoveData.path.length = 0;
            this.mMoveData.path = [];
            this.mMoveData = null;
        }
        if (this.mStateManager) {
            this.mStateManager.destroy();
            this.mStateManager = null;
        }
        this.removeFromWalkableMap();
        this.removeDisplay();
        if (this.mModel) {
            this.mModel.destroy();
            this.mModel = null;
        }
        this.mDisplayInfo = null;
        this.mElementManager = null;
        this.mMovePoints = null;
        this.mRoomService = null;
        super.destroy();
    }

    protected _doMove(time?: number, delta?: number) {
        this.moveControll.update(time, delta);
        const pos = this.moveControll.position;
        // this.mModel.setPosition(pos.x, pos.y);
        this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y);
        if (!this.mMoveData) return;
        const path = this.mMoveData.path;
        if (!path || !path[0]) return;
        const pathData = path[0];
        if (!pathData) return;
        const pathPos = pathData.pos;
        // 允许1.5误差。delta存在波动避免停不下来
        const speed = this.mModel.speed * delta * 1.5;
        if (Tool.twoPointDistance(pos, pathPos) <= speed) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
            } else {
                this.stopMove();
            }
        } else {
            this.checkDirection();
        }
    }

    protected async createDisplay(): Promise<any> {
        if (this.mCreatedDisplay) {
            Logger.getInstance().debug("mCreatedDisplay", this.id);
            return;
        }
        super.createDisplay();

        if (!this.mDisplayInfo || !this.mElementManager) {
            Logger.getInstance().debug("no displayInfo", this);
            return;
        }
        let createPromise: Promise<any> = null;
        // const { id, pos, nickname, nodeType, sound, titleMask, attrs, hasInteractive } = this.mModel;
        // const data = { id, pos, nickname, nodeType, sound, titleMask, attrs, hasInteractive};
        if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
            if (this.isUser) {
                createPromise = this.mElementManager.roomService.game.peer.render.createUserDragonBones(this.id, this.mDisplayInfo as IDragonbonesModel, this.mModel.layer, this.mModel.nodeType);
            } else {
                createPromise = this.mElementManager.roomService.game.peer.render.createDragonBones(this.id, this.mDisplayInfo as IDragonbonesModel, this.mModel.layer, this.mModel.nodeType);
            }
        } else {
            createPromise = this.mElementManager.roomService.game.peer.render.createFramesDisplay(this.id, this.mDisplayInfo as IFramesModel, this.mModel.layer, this.mModel.nodeType);
        }

        this.mElementManager.roomService.game.renderPeer.editorModeDebugger.getIsDebug()
            .then((isDebug) => {
                if (isDebug) this.showRefernceArea();
            });

        createPromise.then(() => {
            // const pos = this.mModel.pos;
            // this.mElementManager.roomService.game.peer.render.setPosition(this.id, pos.x, pos.y);
            if (currentAnimation) this.mElementManager.roomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
        }).catch((error) => {
            Logger.getInstance().error("promise error ====>", error);
        });
        const currentAnimation = this.mModel.currentAnimation;
        if (this.mInputEnable) this.setInputEnable(this.mInputEnable);
        if (this.mTopDisplay) this.showTopDisplay(this.mTopDisplay);
        this.addBody();
        return Promise.resolve();
    }

    protected loadDisplayInfo(): Promise<any> {
        this.mRoomService.game.emitter.once("dragonBones_initialized", this.onDisplayReady, this);
        const id = this.mDisplayInfo.id || this.mModel.displayInfo.id;
        const discriminator = this.mDisplayInfo.discriminator || this.mModel.displayInfo.discriminator;
        const eventName = this.mDisplayInfo.eventName || this.mModel.displayInfo.eventName;
        const avatarDir = this.mDisplayInfo.avatarDir || this.mModel.displayInfo.avatarDir;
        const animationName = this.mDisplayInfo.animationName || this.mModel.displayInfo.animationName;
        const sound = this.mDisplayInfo.sound || undefined;
        const obj = {
            discriminator,
            id,
            eventName,
            avatarDir,
            animationName,
            avatar: undefined,
            gene: undefined,
            type: "",
            sound,
            display: null,
            animations: undefined,
        };
        if (discriminator === "DragonbonesModel") {
            obj.avatar = (<any>this.mDisplayInfo).avatar || (<any>this.mModel.displayInfo).avatar;
        } else {
            obj.gene = (<any>this.mDisplayInfo).type || (<any>this.mModel.displayInfo).gene;
            obj.type = (<any>this.mDisplayInfo).type || (<any>this.mModel.displayInfo).type;
            obj.display = (<any>this.mDisplayInfo).display || (<any>this.mModel.displayInfo).avatar;
            obj.animations = (<any>this.mDisplayInfo).animations || (<any>this.mModel.displayInfo).animations;
        }
        return this.mRoomService.game.renderPeer.updateModel(this.id, obj);
    }

    protected onDisplayReady() {
        if (this.mModel.mountSprites && this.mModel.mountSprites.length > 0) {
            this.updateMounth(this.mModel.mountSprites);
        }
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
    }

    protected async addDisplay(): Promise<any> {
        if (this.mCreatedDisplay) return;
        super.addDisplay();
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        // if (this.mStateManager) {
        //     this.mStateManager.execAllState();
        // }
        return Promise.resolve();
    }

    protected async removeDisplay(): Promise<any> {
        super.removeDisplay();
        return Promise.resolve();
    }

    protected setDepth(depth: number) {
        if (!this.mElementManager) return;
        this.mElementManager.roomService.game.peer.render.setLayerDepth(true);
    }

    protected get offsetY(): number {
        if (this.mOffsetY === undefined) {
            if (
                !this.mElementManager ||
                !this.mElementManager.roomService ||
                !this.mElementManager.roomService.roomSize
            ) {
                return 0;
            }
            this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
        }
        return 0;
    }

    protected addToBlock(): Promise<any> {
        if (!this.mDisplayInfo) return Promise.resolve();
        return super.addToBlock();
    }

    protected checkDirection() {
    }

    protected calculateDirectionByAngle(angle: any) {
        let direction = -1;
        if (angle > 90) {
            direction = 3;
        } else if (angle >= 0) {
            direction = 5;
        } else if (angle >= -90) {
            direction = 7;
        } else {
            direction = 1;
        }
        return direction;
    }

    protected mergeMounth(mounts: number[]) {
        const oldMounts = this.mModel.mountSprites || [];
        const room = this.mRoomService;
        for (const id of oldMounts) {
            if (mounts.indexOf(id) === -1) {
                const ele = room.getElement(id);
                if (ele) {
                    this.removeMount(ele, this.mModel.pos);
                }
            }
        }
    }

    protected updateMounth(mounts: number[]) {
        const room = this.mRoomService;
        if (mounts.length > 0) {
            for (let i = 0; i < mounts.length; i++) {
                const ele = room.getElement(mounts[i]);
                if (ele) {
                    this.addMount(ele, i);
                }
            }
        }

        this.mModel.mountSprites = mounts;
    }

    protected animationChanged(data: any) {
        this.mElementManager.roomService.game.renderPeer.displayAnimationChange(data);
    }

    protected drawBody() {
        if (this.mRootMount) {
            this.moveControll.removePolygon();
            return;
        }
        super.drawBody();
    }

    private _startMove(points: any) {
        const _points = [];
        points.forEach((pos) => {
            const movePoint = op_def.MovePoint.create();
            const tmpPos = op_def.PBPoint3f.create();
            tmpPos.x = pos.x;
            tmpPos.y = pos.y;
            movePoint.pos = tmpPos;
            // 给每个同步点时间戳
            movePoint.timestamp = new Date().getTime();
            _points.push(movePoint);
        });
        const movePath = op_def.MovePath.create();
        movePath.id = this.id;
        movePath.movePos = _points;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE = packet.content;
        content.movePath = movePath;
        this.mRoomService.game.connection.send(packet);
    }
}
