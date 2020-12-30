import { op_client, op_def } from "pixelpai_proto";
import { AnimationQueue, AvatarSuitType, ElementStateType, ISprite, PlayerState } from "structure";
import { IDragonbonesModel } from "structure";
import { IFramesModel } from "structure";
import { IPos, Logger, LogicPos, Tool } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";
import { IElementManager } from "./element.manager";
import { delayTime } from "../../game";
export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;
    readonly created: boolean;

    readonly moveData: MoveData;

    model: ISprite;

    update(time?: number, delta?: number);

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

    removeMount(ele: IElement, targetPos?: IPos): this;

    getInteractivePositionList(): Promise<IPos[]>;
}
export interface MoveData {
    destPos?: LogicPos;
    posPath?: MovePath[];
    arrivalTime?: number;
    tweenAnim?: any;
    tweenLineAnim?: any;
    tweenLastUpdate?: number;
    onCompleteParams?: any;
    // onComplete?: Function;
    step?: number;
    path?: MovePos[];
}

export interface MovePos {
    x: number;
    y: number;
    stopDir?: number;
}

export interface MovePath {
    x: number;
    y: number;
    direction: number;
    duration?: number;
    onStartParams?: any;
    // onStart?: Function;
    // onComplete?: Function;
}

export enum InputEnable {
    Diasble,
    Enable,
    Interactive,
}

export class Element extends BlockObject implements IElement {
    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
    }

    get roomService(): IRoomService {
        return this.mRoomService;
    }

    get id(): number {
        return this.mId; // this.mDisplayInfo.id || 0;
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

    public async load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false): Promise<any> {
        this.mDisplayInfo = displayInfo;
        this.isUser = isUser;
        await this.loadDisplayInfo();
        return this.addToBlock();
    }

    public async setModel(model: ISprite) {
        this.mModel = model;
        if (!model) {
            return;
        }
        this.mQueueAnimations = undefined;
        await this.load(this.mModel.displayInfo);
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        await this.mElementManager.roomService.game.peer.render.setModel(model);
        await this.mRoomService.game.peer.physicalPeer.setModel(model);
        this.showNickname();
        this.setDirection(this.mModel.direction);
        const frameModel = <IFramesModel>this.mDisplayInfo;
        if (this.mInputEnable === InputEnable.Interactive) {
            this.setInputEnable(this.mInputEnable);
        }
        if (model.mountSprites && model.mountSprites.length > 0) {
            this.updateMounth(model.mountSprites);
        }
        if (this.mRenderable) {
            this.mRoomService.game.physicalPeer.addBody(this.id);
        }
    }

    public updateModel(model: op_client.ISprite, avatarType?: op_def.AvatarStyle) {
        if (this.mModel.id !== model.id) {
            return;
        }
        // 更新物理进程的物件/人物element
        this.mRoomService.game.physicalPeer.updateModel(model);
        if (model.hasOwnProperty("attrs")) {
            this.model.updateAttr(model.attrs);
        }
        if (avatarType === op_def.AvatarStyle.SuitType) {
            if (this.mModel.updateSuits) {
                this.mModel.updateAvatarSuits(this.mModel.suits);
                if (!this.mModel.avatar) this.mModel.avatar = AvatarSuitType.createBaseAvatar();
                this.mModel.updateAvatar(this.mModel.avatar);
                this.load(this.mModel.displayInfo);
            }
        } else if (avatarType === op_def.AvatarStyle.OriginAvatar) {
            if (model.hasOwnProperty("avatar")) {
                this.mModel.updateAvatar(model.avatar);
                this.load(this.mModel.displayInfo);
            }
        }

        if (model.display && model.animations) {
            this.mModel.updateDisplay(model.display, model.animations);
            this.load(this.mModel.displayInfo);
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
        // if (model.hasOwnProperty("point3f")) {
        //     const pos = model.point3f;
        //     this.setPosition(new LogicPos(pos.x, pos.y, pos.z));
        // }
        this.update();
    }

    public play(animationName: string, times?: number): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Element.name}: sprite is empty`);
            return;
        }
        // if (this.mModel.currentAnimationName !== animationName) {
        this.mModel.setAnimationName(animationName);
        // }
        // 部分动画可能会重新播放
        // if (!this.mDisplay) {
        //     return Logger.getInstance().warn("display can't initlized");
        // }

        if (times !== undefined) {
            times = times > 0 ? times - 1 : -1;
        }
        if (this.mElementManager) this.mElementManager.roomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation, undefined, times);
        // this.mDisplay.play(this.model.currentAnimation, undefined, times);
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
            // if (animation.times > 0) {
            //     aq.complete = () => {
            //         const anis = this.model.animationQueue;
            //         anis.shift();
            //         let aniName: string = PlayerState.IDLE;
            //         let playTiems;
            //         if (anis.length > 0) {
            //             aniName = anis[0].name;
            //             playTiems = anis[0].playTimes;
            //         }
            //         this.play(aniName, playTiems);
            //         // const aniName = anis.length > 0 ? anis[0].name : PlayerState.IDLE;
            //     };
            // }
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
        if (this.mDisplayInfo) {
            this.mDisplayInfo.avatarDir = val;
        }
        if (this.model && !this.model.currentAnimationName) {
            this.model.currentAnimationName = PlayerState.IDLE;
        }
        if (this.model) {
            this.model.setDirection(val);
            // this.mDisplay.play(this.model.currentAnimation);
        }
        this.play(this.model.currentAnimationName);
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
        //     if (!this.mDisplay) {
        //         return;
        //     }
        //     if (!val) {
        //         val = PlayerState.IDLE;
        //     }
        //     this.play(this.mCurState);
    }

    public getState(): string {
        return this.mCurState;
    }

    public getRenderable(): boolean {
        return this.mRenderable;
    }

    public update(time?: number, delta?: number) {
        if (this.mDirty === false && this.mMoving === false) {
            return;
        }
        // this._doMove(time, delta);
        this.mDirty = false;
    }

    // public move(moveData: op_client.IMoveData) {
    //     if (!this.mElementManager) {
    //         return; // Logger.getInstance().error(`Element::move - Empty element-manager.`);
    //     }
    //     this.mMoveData.arrivalTime = moveData.timestemp;
    //     this.mMoveData.posPath = [
    //         {
    //             x: moveData.destinationPoint3f.x,
    //             y: moveData.destinationPoint3f.y,
    //             direction: moveData.direction
    //         },
    //     ];
    //     this._doMove();
    // }

    public move(path: MovePos[]) {
        if (!this.mElementManager) {
            return; // Logger.getInstance().error(`Element::move - Empty element-manager.`);
        }
        this.mMoveData.path = path;
        this.startMove();
    }

    public stopAt(pos: MovePos) {
        let path = this.mMoveData.path;
        if (!path) {
            path = [];
        }
        path.push(pos);
        this.startMove();
    }

    // public movePosition(pos: LogicPos, angel: number) {
    //     if (!this.mElementManager) {
    //         return;
    //     }
    //     this.startMove();
    //     if (!pos.depth) pos.depth = this.getDepth();
    //     this.setPosition(pos, true);
    //     const direction = this.calculateDirectionByAngle(angel);
    //     if (direction !== -1 && direction !== this.model.direction) {
    //         this.setDirection(direction);
    //     }
    // }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        if (!this.mElementManager) {
            return;
        }
        const tmpPath = movePath.path;
        if (!tmpPath) {
            return;
        }
        this.mMoveData.arrivalTime = movePath.timestemp;
        const pos = this.mModel.pos;
        let lastPos = new LogicPos(pos.x, pos.y - this.offsetY);
        const paths = [];
        let angle = null;
        let point = null;
        let now = this.mElementManager.roomService.now();
        let duration = 0;
        let index = 0;
        for (const path of movePath.path) {
            point = path.point3f;
            if (!(point.y === lastPos.y && point.x === lastPos.x)) {
                angle = Math.atan2(point.y - lastPos.y, point.x - lastPos.x) * (180 / Math.PI);
            }
            now += duration;
            duration = path.timestemp - now;
            paths.push({
                x: point.x,
                y: point.y,
                duration,
                onStartParams: angle,
                // onStart: (tween, target, params) => {
                //     this.onCheckDirection(params);
                // },
            });
            lastPos = new LogicPos(point.x, point.y);
            index++;
        }
        this.mMoveData.posPath = paths;
        this._doMove();
    }

    public startMove() {
        if (!this.mMoveData) {
            return;
        }
        const path = this.mMoveData.path;
        if (!path || path.length < 1) {
            return;
        }
        this.changeState(PlayerState.WALK);
        this.mMoving = true;
        this.setStatic(false);

        const pos = this.getPosition();
        // pos.y += this.offsetY;
        const angle = Math.atan2(path[0].y - pos.y, path[0].x - pos.x);
        const speed = this.mModel.speed * delayTime;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    public completeMove() {
        Logger.getInstance().log("complete_walk");
    }

    public stopMove() {
        this.mMoving = false;
        // TODO display未创建的情况下处理
        // if (!this.mDisplay) {
        //     // Logger.getInstance().error(`can't stopMove, display does not exist`);
        //     return;
        // }
        if (this.mMoveData && this.mMoveData.posPath) {
            // this.mModel.setPosition(this.mDisplay.x, this.mDisplay.y);
            // delete this.mMoveData.destPos;
            delete this.mMoveData.posPath;
            if (this.mMoveData.arrivalTime) this.mMoveData.arrivalTime = 0;
            if (this.mMoveData.tweenLineAnim) {
                this.mMoveData.tweenLineAnim.stop();
                this.mMoveData.tweenLineAnim.destroy();
            }
        }
        this.changeState(PlayerState.IDLE);
        this.setVelocity(0, 0);
        this.setStatic(true);
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
        // if (this.mMoving) {
        //     this.stopMove();
        // }
        if (p) {
            this.mModel.setPosition(p.x, p.y);
            // if (this.mRootMount) {
            //     return;
            // }
            // this.mElementManager.roomService.game.peer.render.setPosition(this.id, p.x, p.y);
            // const depth = p.depth ? p.depth : 0;
            // this.setDepth(depth);
        }
        // if (!update) return;
        // this.updateBlock();
        // this.update();
    }

    public getRootPosition(): IPos {
        return this.mModel.pos;
    }

    public showBubble(text: string, setting: op_client.IChat_Setting) {
        this.mRoomService.game.peer.render.showBubble(this.id, text, setting);
    }
    public clearBubble() {
        this.mRoomService.game.peer.render.clearBubble(this.id);
    }

    public showNickname() {
        if (!this.mModel) return;
        Logger.getInstance().log("showNickName======" + this.mModel.nickname);
        this.mRoomService.game.renderPeer.showNickname(this.id, this.mModel.nickname);
    }

    public hideNickname() {
        // this.removeFollowObject(FollowEnum.Nickname);
    }

    public showTopDisplay(data?: ElementStateType) {
        this.mRoomService.game.renderPeer.showTopDisplay(this.id, data);
    }

    public removeTopDisplay() {

    }

    public showRefernceArea() {
        const area = this.mModel.getCollisionArea();
        const origin = this.mModel.getOriginPoint();
        if (!area || !origin) return;
        this.mRoomService.game.renderPeer.showRefernceArea(this.id, area, origin);
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
                // if ((<Room>this.mRoomService).isWalkableAt(pos45.x + interactive.x, pos45.y + interactive.y)) {
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
        // if (this.mDisplay) this.mDisplay.play(this.mModel.currentAnimation);
    }

    public setAlpha(val: number) {
    }

    public mount(root: IElement) {
        this.mRootMount = root;
        if (this.mMoving) {
            this.stopMove();
        }
        this.disableBlock();
        this.mDirty = true;
        return this;
    }

    public async unmount(): Promise<this> {
        if (this.mRootMount) {
            // 先移除避免人物瞬移
            // this.removeDisplay();
            const pos = await this.mRootMount.getPosition();
            // pos.x += this.mDisplay.x;
            // pos.y += this.mDisplay.y;
            this.mRootMount = null;
            this.setPosition(pos, true);
            this.enableBlock();
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

    public removeMount(ele: IElement, targetPos?: IPos) {
        ele.unmount(targetPos);
        if (!this.mMounts) return this;
        this.mRoomService.game.renderPeer.unmount(this.id, ele.id);
        const index = this.mMounts.indexOf(ele);
        if (index > -1) {
            this.mMounts.splice(index, 1);
        }
        return this;
    }

    public setState(states: op_def.IState[]) {
        for (const state of states) {
            switch (state.execCode) {
                case op_def.ExecCode.EXEC_CODE_ADD:
                case op_def.ExecCode.EXEC_CODE_UPDATE:
                    this.updateStateHandler(state);
                    break;
                case op_def.ExecCode.EXEC_CODE_DELETE:
                    this.removeStateHandler(state);
                    break;
            }
        }
    }

    public getDepth() {
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        return depth;
    }

    public destroy() {
        this.mCreatedDisplay = false;
        if (this.mMoveData && this.mMoveData.tweenAnim) {
            this.mMoveData.tweenAnim.stop();
            this.mMoveData.tweenAnim.remove();
            this.mMoveData.tweenAnim = null;
            this.mMoveData = null;
        }
        this.removeDisplay();
        super.destroy();
    }

    protected _doMove(time?: number, delta?: number) {
        if (!this.mMoving) {
            return;
        }
        const _pos = this.getPosition();
        const pos = new LogicPos(_pos.x / this.mRoomService.game.scaleRatio, _pos.y / this.mRoomService.game.scaleRatio);
        this.mModel.setPosition(pos.x, pos.y);
        this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y);
        this.checkDirection();
        const path = this.mMoveData.path;
        const speed = this.mModel.speed * delta;
        if (Tool.twoPointDistance(pos, path[0]) <= speed) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
            } else {
                if (path[0].stopDir) {
                    this.stopMove();
                    this.setDirection(path[0].stopDir);
                }
            }
        }
    }

    protected async createDisplay(): Promise<any> {
        if (!this.mDisplayInfo || !this.mElementManager) {
            return;
        }
        if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
            if (this.isUser) {
                await this.mElementManager.roomService.game.peer.render.createUserDragonBones(this.mDisplayInfo as IDragonbonesModel);
            } else {
                await this.mElementManager.roomService.game.peer.render.createDragonBones(this.id, this.mDisplayInfo as IDragonbonesModel);
            }
        } else {
            // (this.mDisplayInfo as IFramesModel).gene = this.mDisplayInfo.mGene;
            await this.mElementManager.roomService.game.peer.render.createFramesDisplay(this.id, this.mDisplayInfo as IFramesModel);
        }
        const pos = this.mModel.pos;
        await this.mElementManager.roomService.game.peer.render.setPosition(this.id, pos.x, pos.y);
        const currentAnimation = this.mModel.currentAnimation;
        if (currentAnimation) await this.mElementManager.roomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
        this.setInputEnable(this.mInputEnable);
        this.mCreatedDisplay = true;
        this.mRoomService.game.physicalPeer.addBody(this.id);
        this.roomService.game.emitter.emit("ElementCreated", this.id);
        return Promise.resolve();
    }

    protected loadDisplayInfo(): Promise<any> {
        // this.mElementManager.roomService.game.peer.render.loadDisplayInfo(this.mDisplayInfo);
        // if (!this.mDisplayInfo) {
        //     return;
        // }
        // if (!this.mDisplay) {
        //     this.createDisplay();
        // }
        this.mRoomService.game.emitter.once("dragonBones_initialized", this.onDisplayReady, this);
        return this.mRoomService.game.renderPeer.updateModel(this.id, this.mDisplayInfo);
        // this.mDisplay.on("updateAnimation", this.onUpdateAnimationHandler, this);
        // this.mDisplay.load(this.mDisplayInfo);
    }

    protected onDisplayReady() {
        this.mRoomService.game.renderPeer.displayReady(this.id, this.model.currentAnimation);
        if (this.mModel.mountSprites && this.mModel.mountSprites.length > 0) {
            this.updateMounth(this.mModel.mountSprites);
        }
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        this.setDepth(depth);
        this.update();
        // this.mDisplay.showRefernceArea();
        // }
    }

    protected async addDisplay(): Promise<any> {
        await this.createDisplay();
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        this.setDepth(depth);
        return Promise.resolve();
    }

    protected async removeDisplay(): Promise<any> {
        await super.removeDisplay();
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
            // this.mOffsetY = 0;
            this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
        }
        return 0; // this.mOffsetY;
    }

    protected addToBlock(): Promise<any> {
        if (!this.mDisplayInfo) return Promise.resolve();
        return super.addToBlock();
    }

    protected checkDirection() {
    }

    protected onCheckDirection(params: any): number {
        if (typeof params !== "number") {
            return;
        }
        // 重叠
        if (params > 90) {
            // this.setDirection(3);
            return 3;
        } else if (params >= 0) {
            // this.setDirection(5);
            return 5;
        } else if (params >= -90) {
            // this.setDirection(7);
            return 7;
        } else {
            // this.setDirection(1);
            return 1;
        }
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
                    this.removeMount(ele);
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
            // const playerManager = this.mElementManager.roomService;
        }

        this.mModel.mountSprites = mounts;
    }

    protected updateStateHandler(state: op_def.IState) {
        // let buf = null;
        // let id = null;
        // switch (state.name) {
        //     case "effect":
        //         buf = Buffer.from(state.packet);
        //         id = buf.readDoubleBE(0);
        //         const effect = this.roomService.effectManager.add(this.id, id);
        //         if (effect.displayInfo) {
        //             this.showEffected(effect.display);
        //         } else {
        //             effect.once("updateDisplayInfo", this.showEffected, this);
        //         }
        //         break;
        //     case "Task":
        //         buf = Buffer.from(state.packet);
        //         const type = buf.readDoubleBE(0);
        //         id = buf.readDoubleBE(8);
        //         const ele = this.roomService.getElement(id);
        //         if (ele) {
        //             if (type === 0) {
        //                 (<Element>ele).removeTopDisplay();
        //             } else {
        //                 (<Element>ele).showTopDisplay(ElementStateType.REPAIR);
        //             }
        //         }
        //         break;
        // }
    }

    protected removeStateHandler(state: op_def.IState) {
        // switch (state.name) {
        //     case "effect":
        //         // remove
        //         if (this.mDisplay) {
        //             this.mDisplay.removeEffect(DisplayField.Effect);
        //         }
        //         // const buf = Buffer.from(state.packet);
        //         // const id = buf.readDoubleBE(0);
        //         this.roomService.effectManager.remove(this.id);
        //         break;
        //     case "Task":
        //         break;
        // }
    }
}
