import { LayerEnum } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import {
    AnimationQueue,
    AvatarSuitType,
    ElementStateType,
    IDragonbonesModel,
    IFramesModel,
    ISprite,
    PlayerState, DirectionChecker, IPos, IProjection, Logger, LogicPoint, LogicPos
} from "structure";
import { Tool } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room";
import { ElementStateManager } from "../state/element.state.manager";
import { IElementManager } from "./element.manager";
import { InputEnable } from "./input.enable";

export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;
    readonly created: boolean;

    readonly moveData: MoveWorkerData;

    state: boolean;

    model: ISprite;

    update(time?: number, delta?: number);

    startFireMove(pos: IPos);

    startMove();

    stopMove();

    setModel(model: ISprite);

    updateModel(model: op_client.ISprite);

    play(animationName: string): void;

    setPosition(p: IPos, update: boolean): void;

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

    getInteractivePositionList(): Promise<IPos[]>;

    getProjectionSize(): IProjection;

    addToWalkableMap();

    removeFromWalkableMap();
}

export interface MoveWorkerData {
    step?: number;
    path?: op_def.IMovePoint[];
    arrivalTime?: number;
}

export interface MoveWorkerPos {
    x: number;
    y: number;
    stopDir?: number;
}

export interface MoveWorkerPath {
    x: number;
    y: number;
    direction: number;
    duration?: number;
    onStartParams?: any;
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

    get moveData(): MoveWorkerData {
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
    protected mMoveData: MoveWorkerData = {};
    protected mCurState: string = PlayerState.IDLE;
    protected mOffsetY: number = undefined;
    protected mQueueAnimations: AnimationQueue[];
    protected mMoving: boolean = false;
    protected mRootMount: IElement;
    protected mMounts: IElement[];
    protected mDirty: boolean = false;
    protected mCreatedDisplay: boolean = false;
    protected isUser: boolean = false;
    protected moveControll: MoveControll;
    protected mStateManager: ElementStateManager;
    protected mTopDisplay: any;
    protected mTarget;

    private delayTime = 1000 / 45;
    private mState: boolean = false;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite ? sprite.id : -1, mElementManager ? mElementManager.roomService : undefined);
        if (!sprite) {
            return;
        }
        this.moveControll = new MoveControll(this);
        this.mId = sprite.id;
        this.model = sprite;
    }

    showEffected(displayInfo: any) {
        throw new Error("Method not implemented.");
    }

    public async load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false): Promise<any> {
        this.mDisplayInfo = displayInfo;
        this.isUser = isUser;
        await this.loadDisplayInfo();
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
        this.removeFromWalkableMap();
        this.mModel = model;
        this.mQueueAnimations = undefined;
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        const area = model.getCollisionArea();
        const obj = { id: model.id, pos: model.pos, nickname: model.nickname, alpha: model.alpha, titleMask: model.titleMask | 0x00020000, hasInteractive: model.hasInteractive };
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
                this.addToWalkableMap();
                return this.setRenderable(true);
            });
        // physic action
        const obj1 = {
            id: model.id,
            point3f: model.pos,
            currentAnimationName: model.currentAnimationName,
            direction: model.direction,
            mountSprites: model.mountSprites,
            speed: model.speed,
            displayInfo: model.displayInfo
        };
        this.mRoomService.game.peer.physicalPeer.setModel(obj1)
            .then(() => {
                if (this.mRenderable) {
                    this.addBody();
                    // if (model.nodeType !== op_def.NodeType.CharacterNodeType) this.mRoomService.game.physicalPeer.addBody(this.id);
                }
            });
    }

    public updateModel(model: op_client.ISprite, avatarType?: op_def.AvatarStyle) {
        if (this.mModel.id !== model.id) {
            return;
        }
        this.removeFromWalkableMap();
        if (model.hasOwnProperty("attrs")) {
            this.mModel.updateAttr(model.attrs);
        }
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
            }
            reload = true;
        }

        if (model.display && model.animations) {
            this.mModel.updateDisplay(model.display, model.animations);
            reload = true;
        }
        if (model.hasOwnProperty("currentAnimationName")) {
            this.play(model.currentAnimationName);
            this.setInputEnable(this.mInputEnable);
            this.mModel.setAnimationQueue(undefined);
        }
        if (model.hasOwnProperty("direction")) {
            this.setDirection(model.direction);
        }
        if (model.hasOwnProperty("mountSprites")) {
            const mounts = model.mountSprites;
            this.mergeMounth(mounts);
            this.updateMounth(mounts);
        }
        if (model.hasOwnProperty("speed")) {
            this.mModel.speed = model.speed;
            // 速度改变，重新计算
            if (this.mMoving) this.startMove();
        }
        if (reload) this.load(this.mModel.displayInfo);
        // 更新物理进程的物件/人物element
        // this.mRoomService.game.physicalPeer.updateModel(model);
        this.updateBody(model);
        this.addToWalkableMap();
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
                if (times === undefined) {
                    this.mRoomService.game.physicalPeer.changeAnimation(this.id, this.mModel.currentAnimation.name);
                } else {
                    this.mRoomService.game.physicalPeer.changeAnimation(this.id, this.mModel.currentAnimation.name, times);
                }
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

    public update(time?: number, delta?: number) {
        if (this.mMoving === false) {
            return;
        }
        this._doMove(time, delta);
        this.mDirty = false;
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

    public stopMove(points?: any) {
        this.mMoving = false;
        this.moveControll.setVelocity(0, 0);
        this.changeState(PlayerState.IDLE);
        if (!this.mRoomService.playerManager.actor.stopBoxMove) return;
        const mMovePoints = [];
        if (points) {
            points.forEach((pos) => {
                const movePoint = op_def.MovePoint.create();
                const tmpPos = op_def.PBPoint3f.create();
                tmpPos.x = pos.x;
                tmpPos.y = pos.y;
                movePoint.pos = tmpPos;
                // 给每个同步点时间戳
                movePoint.timestamp = new Date().getTime();
                mMovePoints.push(tmpPos);
            });
        }
        const movePath = op_def.MovePath.create();
        movePath.id = this.id;
        movePath.movePos = mMovePoints;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE = pkt.content;
        ct.movePath = movePath;
        this.mElementManager.connection.send(pkt);
        this.mRoomService.playerManager.actor.stopBoxMove = false;
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

    public setPosition(p: IPos, update: boolean = false) {
        if (!this.mElementManager) {
            return;
        }
        if (p) {
            this.mModel.setPosition(p.x, p.y);
            if (this.moveControll) this.moveControll.setPosition(p.x, p.y);
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
        // Logger.getInstance().debug("showNickName======" + this.mModel.nickname);
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

    public async getInteractivePositionList(): Promise<IPos[]> {
        const interactives = this.mModel.getInteractive();
        if (!interactives || interactives.length < 1) {
            return;
        }
        const pos45 = this.mRoomService.transformToMini45(this.getPosition());
        const result: IPos[] = [];
        for (const interactive of interactives) {
            if (await this.mRoomService.game.physicalPeer.isWalkableAt(pos45.x + interactive.x, pos45.y + interactive.y)) {
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
        Logger.getInstance().log("removeMount ===>", targetPos);
        if (!this.mMounts) return Promise.resolve();
        this.mRoomService.game.renderPeer.unmount(this.id, ele.id);
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
        this.removeDisplay();
        super.destroy();
    }

    protected _doMove(time?: number, delta?: number) {
        this.moveControll.update(time, delta);
        const pos = this.moveControll.position;
        this.mModel.setPosition(pos.x, pos.y);
        this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y);
        if (!this.mMoveData) return;
        const path = this.mMoveData.path;
        if (!path || !path[0]) return;
        const pathData = path[0];
        if (!pathData) return;
        const pathPos = pathData.pos;
        const speed = this.mModel.speed * delta;
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
        const obj = {
            discriminator,
            id,
            eventName,
            avatarDir,
            animationName,
            avatar: undefined,
            gene: undefined,
            type: "",
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

    protected addBody() {
        if (this.mRootMount) {
            return;
        }
        super.addBody();
    }

    protected updateBody(model) {
        if (this.mRootMount) {
            return;
        }
        super.updateBody(model);
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

class MoveControll {
    private velocity: IPos;
    private mPosition: IPos;
    private mPrePosition: IPos;

    constructor(private target: BlockObject) {
        this.mPosition = new LogicPos();
        this.mPrePosition = new LogicPos();
        this.velocity = new LogicPoint();
    }

    setVelocity(x: number, y: number) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    update(time: number, delta: number) {
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            this.mPrePosition.x = this.mPosition.x;
            this.mPrePosition.y = this.mPosition.y;
            this.mPosition.x += this.velocity.x;
            this.mPosition.y += this.velocity.y;
        }
    }

    setPosition(x: number, y: number) {
        this.mPosition.x = x;
        this.mPosition.y = y;
    }

    get position(): IPos {
        return this.mPosition;
    }

    get prePosition(): IPos {
        return this.mPrePosition;
    }
}
