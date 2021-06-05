import { LayerEnum } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Game } from "../../game";
import {
    AnimationQueue,
    AvatarSuitType,
    ElementStateType,
    IDragonbonesModel,
    IFramesModel,
    ISprite,
    PlayerState
} from "structure";
import { DirectionChecker, IPos, IProjection, Logger, LogicPos, Tool } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";
import { ElementStateManager } from "../state/element.state.manager";
import { IElementManager } from "./element.manager";
import { ElementState } from "structure";
import { Sprite } from "baseModel";

export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;
    readonly created: boolean;

    readonly moveData: MoveData;

    state: ElementState;

    model: ISprite;

    update(time?: number, delta?: number);

    startFireMove(pos: IPos);

    move(path: op_def.IMovePoint[]);

    stopMove();

    startPush(point?: any);

    setModel(model: op_client.ISprite);

    updateModel(model: op_client.ISprite);

    play(animationName: string): void;

    setPosition(p: IPos, syncPos?: boolean): void;

    getPosition(): IPos;

    getPosition45(): IPos;

    setDirection(val: number): void;

    getDirection(): number;

    showEffected(displayInfo: IFramesModel);

    showNickname();

    hideNickname();

    showRefernceArea();

    hideRefernceArea();

    turn();

    setAlpha(val: number);

    setQueue(queue: op_client.IChangeAnimation[]);

    completeAnimationQueue();

    mount(ele: IElement): this;

    unmount(targetPos?: IPos): Promise<this>;

    addMount(ele: IElement, index?: number): this;

    removeMount(ele: IElement, targetPos?: IPos): Promise<void>;

    getInteractivePositionList(): IPos[];

    getProjectionSize(): IProjection;

    addToWalkableMap();

    removeFromWalkableMap();
}

export interface MoveData {
    step?: number;
    path?: op_def.IMovePoint[];
    arrivalTime?: number;
    targetId?: number;
}

export enum InputEnable {
    Diasble,
    Enable,
    Interactive,
}

export class Element extends BlockObject implements IElement {
    get state(): ElementState {
        return this.mState;
    }

    set state(val) {
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
        this.mModel = val;
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
    protected mStateManager: ElementStateManager;
    protected mTopDisplay: any;
    // 移动
    protected readonly mMoveDelayTime: number = 400;
    protected mMoveTime: number = 0;
    protected readonly mMoveSyncDelay = 200;
    protected mMoveSyncTime: number = 0;
    protected mMovePoints: any[];
    protected mTarget;

    private delayTime = 1000 / 45;
    private mState: ElementState = ElementState.NONE;
    private mUpdateAvatarType;

    constructor(protected game: Game, protected mElementManager: IElementManager) {
        super(mElementManager ? mElementManager.roomService : undefined);
        this.mState = ElementState.INIT;
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
        this.updateMoveData();
    }

    public async load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false): Promise<any> {
        this.mDisplayInfo = displayInfo;
        this.isUser = isUser;
        if (!displayInfo) return Promise.reject(`element ${this.mModel.nickname} ${this.id} display does not exist`);
        this.mState = ElementState.DATADEALING;
        await this.loadDisplayInfo();
        return this.addToBlock();
    }

    public setModel(baseSprite: op_client.ISprite) {
        if (!baseSprite) {
            return;
        }

        if (!baseSprite.layer) {
            baseSprite.layer = LayerEnum.Surface;
            Logger.getInstance().warn(`${Element.name}: sprite layer is empty`);
        }
        this.mTmpSprite = baseSprite;
        this.mId = this.mTmpSprite.id;
        this.state = ElementState.DATAINIT;
        // ============> 下一帧处理逻辑
        this._dataInit();
    }

    public updateModel(model: op_client.ISprite, avatarType?: op_def.AvatarStyle) {
        if (this.mModel.id !== model.id) {
            return;
        }
        this.mUpdateAvatarType = avatarType;
        this.mState = ElementState.DATAUPDATE;
        // ============> 下一帧处理逻辑
        this._dataUpdate();
    }

    public play(animationName: string, times?: number): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Element.name}: sprite is empty`);
            return;
        }
        const preWalkable = this.mModel.getWalkableArea();
        this.removeFromWalkableMap();
        if (times !== undefined) {
            times = times > 0 ? times : -1;
        }
        this.mModel.setAnimationName(animationName, times);
        const nextWalkable = this.mModel.getWalkableArea();
        const hasInteractive = this.model.hasInteractive;
        if (this.mInputEnable) this.setInputEnable(this.mInputEnable);
        this.addToWalkableMap();
        if (this.mRoomService) {
            if (!this.mRootMount) {
                this.addBody();
            }
            this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation, undefined, times);
            this.mRoomService.game.renderPeer.setHasInteractive(this.id, hasInteractive);
        }
    }

    public setQueue(animations: op_client.IChangeAnimation[]) {
        if (!this.mModel) {
            return;
        }
        const queue = [];
        for (const animation of animations) {
            const aq: AnimationQueue = {
                name: animation.animationName,
                playTimes: animation.times,
            };
            queue.push(aq);
        }
        this.mModel.setAnimationQueue(queue);
        if (queue.length > 0) {
            this.play(animations[0].animationName, animations[0].times);
        }
    }

    public completeAnimationQueue() {
        const anis = this.model.animationQueue;
        if (!anis || anis.length < 1) return;
        let aniName: string = PlayerState.IDLE;
        let playTiems;
        if (anis.length > 0) {
            aniName = anis[0].name;
            playTiems = anis[0].playTimes;
        }
        this.play(aniName, playTiems);
        anis.shift();
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
        // switch (this.mState) {
        //     case ElementState.INIT:
        //         break;
        //     case ElementState.DATAINIT:
        //         this._dataInit();
        //         break;
        //     case ElementState.DATAUPDATE:
        //         this._dataUpdate();
        //         break;
        //     case ElementState.DATACOMPLETE:
        //         break;
        //     case ElementState.PREDESTROY:
        //         this.destroy();
        //         break;
        //     case ElementState.DESTROYED:
        //         break;
        // }
        if (this.mState !== ElementState.DATACOMPLETE) return;
        // ============================= 分割线 =============================
        // 状态判断之后，满足要求走以前move逻辑
        if (this.mMoving === false) return;
        this._doMove(time, delta);
        this.mDirty = false;
        // 同步移动逻辑
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
            this.game.connection.send(packet);
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
        this.updateMoveData();
    }

    public stopMove(stopPos?: any) {
        if (!this.mMovePoints) this.mMovePoints = [];
        this.mMoving = false;
        this.moveControll.setVelocity(0, 0);
        this.changeState(PlayerState.IDLE);
        // 如果主角没有在推箱子，直接跳过
        if (!this.mRoomService.playerManager.actor.stopBoxMove) return;
        Logger.getInstance().log("============>>>>> element stop: ", this.mModel.nickname, this.mModel.pos.x, this.mModel.pos.y);
        this.mMovePoints = [];
        this.mRoomService.playerManager.actor.stopBoxMove = false;
    }

    public startPush(point: any) {
    }

    public getPosition(): IPos {
        let pos: IPos;
        const p = super.getPosition();
        if (this.mRootMount) {
            pos = this.mRootMount.getPosition();
            pos.x += p.x;
            pos.y += p.y;
            pos.z += p.z;
        } else {
            pos = new LogicPos(p.x, p.y, p.z);
        }
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

    public showBubble(text: string, setting: op_client.IChat_Setting) {
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

    }

    public showRefernceArea(conflictMap?: number[][]) {
        const area = this.mModel.getCollisionArea();
        const origin = this.mModel.getOriginPoint();
        if (!area || !origin) return;
        this.mRoomService.game.renderPeer.showRefernceArea(this.id, area, origin, conflictMap);
    }

    public hideRefernceArea() {
        this.mRoomService.game.renderPeer.hideRefernceArea(this.id);
    }

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
        this.removeFromWalkableMap();
        this.removeBody();
        return this;
    }

    public async unmount(): Promise<this> {
        if (this.mRootMount) {
            const pos = this.mRootMount.getPosition();
            this.mRootMount = null;
            this.setPosition(pos, true);
            this.addToWalkableMap();
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

    public addToWalkableMap() {
        if (this.mRootMount) return;
        if (this.model && this.mElementManager) this.mElementManager.roomService.addToWalkableMap(this.model);
    }

    public removeFromWalkableMap() {
        if (this.model && this.mElementManager) this.mElementManager.roomService.removeFromWalkableMap(this.model);
    }

    public setState(stateGroup: op_client.IStateGroup) {
        if (!this.mStateManager) this.mStateManager = new ElementStateManager(this, this.mRoomService);
        this.mStateManager.setState(stateGroup);
    }

    public preDestroy() {
        this.mState = ElementState.PREDESTROY;
        this.destroy();
    }

    public destroy() {
        this.mState = ElementState.DESTROYED;
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
        super.destroy();
    }

    protected _doMove(time?: number, delta?: number) {
        // 真正移动逻辑
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
                this.updateMoveData();
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
        if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
            if (this.isUser) {
                createPromise = this.mElementManager.roomService.game.peer.render.createUserDragonBones(this.mDisplayInfo as IDragonbonesModel, this.mModel.layer);
            } else {
                createPromise = this.mElementManager.roomService.game.peer.render.createDragonBones(this.id, this.mDisplayInfo as IDragonbonesModel, this.mModel.layer, this.mModel.nodeType);
            }
        } else {
            createPromise = this.mElementManager.roomService.game.peer.render.createFramesDisplay(this.id, this.mDisplayInfo as IFramesModel, this.mModel.layer);
        }

        this.mElementManager.roomService.game.renderPeer.editorModeDebugger.getIsDebug()
            .then((isDebug) => {
                if (isDebug) this.showRefernceArea();
            });

        createPromise.then(() => {
            const pos = this.mModel.pos;
            this.mElementManager.roomService.game.peer.render.setPosition(this.id, pos.x, pos.y);
            if (currentAnimation) this.mElementManager.roomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
        }).catch((error) => {
            Logger.getInstance().error("promise error ====>", error);
        });
        const currentAnimation = this.mModel.currentAnimation;
        if (this.mInputEnable) this.setInputEnable(this.mInputEnable);
        if (this.mTopDisplay) this.showTopDisplay(this.mTopDisplay);
        this.addBody();
        this.roomService.game.emitter.emit("ElementCreated", this.id);
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
        return this.mRoomService.game.renderPeer.updateModel(obj.id, obj);
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
        super.addDisplay();
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        if (this.mStateManager) {
            this.mStateManager.execAllState();
        }
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

    /**
     * 下一帧处理setModel
     */
    protected _dataInit() {
        this.removeFromWalkableMap();
        const model = this.mModel = new Sprite(this.mTmpSprite);
        const elementRef = this.roomService.game.elementStorage.getElementRef(this.mTmpSprite.bindId || this.mTmpSprite.id);
        if (elementRef && elementRef.displayModel && !this.mTmpSprite.avatar && !this.mTmpSprite.display) this.mModel.setDisplayInfo(elementRef.displayModel);
        (<any>this.mModel).off("Animation_Change", this.animationChanged, this);
        (<any>this.mModel).on("Animation_Change", this.animationChanged, this);

        this.mQueueAnimations = undefined;
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        this.addToWalkableMap();
        // 必须执行一遍下面的方法，否则无法获取碰撞区域
        const area = model.getCollisionArea();
        const obj = { id: model.id, pos: model.pos, nickname: model.nickname, sound: model.sound, alpha: model.alpha, titleMask: model.titleMask | 0x00020000, hasInteractive: model.hasInteractive };
        // render action
        this.load(this.mModel.displayInfo)
            .then(() => this.mElementManager.roomService.game.peer.render.setModel(obj))
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

    protected _dataUpdate() {
        const model = this.mModel.toSprite();
        this.removeFromWalkableMap();
        // 序列化数据
        if (model.hasOwnProperty("attrs")) {
            this.mModel.updateAttr(model.attrs);
        }
        let reload = false;
        let update = false;
        // 龙骨
        if (this.mUpdateAvatarType === op_def.AvatarStyle.SuitType) {
            if (this.mModel.updateSuits) {
                // 处理套装suits数据
                this.mModel.updateAvatarSuits(this.mModel.suits);
                if (!this.mModel.avatar) this.mModel.avatar = AvatarSuitType.createBaseAvatar();
                // 处理op_gameconfig.IAvatar数据
                this.mModel.updateAvatar(this.mModel.avatar);
                reload = true;
            }
        } else if (this.mUpdateAvatarType === op_def.AvatarStyle.OriginAvatar) {
            if (model.hasOwnProperty("avatar")) {
                this.mModel.updateAvatar(model.avatar);
                reload = true;
            }
        }
        // 序列图
        if (model.display && model.animations) {
            this.mModel.updateDisplay(model.display, model.animations);
            reload = true;
        }

        if (model.hasOwnProperty("currentAnimationName")) {
            this.play(model.currentAnimationName);
            this.setInputEnable(this.mInputEnable);
            this.mModel.setAnimationQueue(undefined);
            update = true;
        }

        if (model.hasOwnProperty("direction")) {
            this.setDirection(model.direction);
            update = true;
        }
        // 上下物件
        if (model.hasOwnProperty("mountSprites")) {
            const mounts = model.mountSprites;
            this.mergeMounth(mounts);
            this.updateMounth(mounts);
            update = true;
        }
        if (model.hasOwnProperty("speed")) {
            this.mModel.speed = model.speed;
            // 速度改变，重新计算
            if (this.mMoving) {
                update = true;
                this.updateMoveData();
            }
        }
        if (model.hasOwnProperty("nickname")) {
            this.mModel.nickname = model.nickname;
            this.showNickname();
            update = true;
        }
        if (reload) {
            this.load(this.mModel.displayInfo);
        }
        this.addToWalkableMap();
    }

    protected _move() {
        this.updateMoveData();
    }

    protected updateMoveData(points?: any) {
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
}
