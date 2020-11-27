import { op_client, op_def } from "pixelpai_proto";
import { AnimationQueue, ElementStateType } from "structure";
import { IDragonbonesModel } from "structure";
import { IFramesModel } from "structure";
import { IPos, Logger, LogicPos } from "utils";
import { BlockObject } from "../block/block.object";
import { ISprite } from "../display/sprite/sprite";
import { IRoomService } from "../room/room";
import { IElementManager } from "./element.manager";

export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;

    model: ISprite;

    update();

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

    // scaleTween();

    turn();

    setAlpha(val: number);

    setQueue(queue: op_client.IChangeAnimation[]);

    completeAnimationQueue();

    mount(ele: IElement): this;

    unmount(): this;

    addMount(ele: IElement, index?: number): this;

    removeMount(ele: IElement): this;
}

export enum PlayerState {
    IDLE = "idle",
    WALK = "walk",
    RUN = "run",
    ATTACK = "attack",
    JUMP = "jump",
    INJURED = "injured",
    FAILED = "failed",
    DANCE01 = "dance01",
    DANCE02 = "dance02",
    FISHING = "fishing",
    GREET01 = "greet01",
    SIT = "sit",
    LIE = "lit",
    EMOTION01 = "emotion01",
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
        if (!this.mElementManager) {
            // Logger.getInstance().error("element manager is undefined");
            return;
        }
        return this.mElementManager.roomService;
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

    // get scene(): Phaser.Scene {
    //     if (this.mElementManager) {
    //         return this.mElementManager.scene;
    //     }
    // }

    // get ai(): AI {
    //     return this.mAi;
    // }

    get eleMgr(): IElementManager {
        if (this.mElementManager) {
            return this.mElementManager;
        }
    }

    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    // protected mDisplay: DisplayObject | undefined;
    // protected mBubble: BubbleContainer;
    protected mAnimationName: string = "";
    protected mMoveData: MoveData = {};
    protected mCurState: string = PlayerState.IDLE;
    // protected mShopEntity: ShopEntity;
    //  protected concomitants: Element[];
    // protected mAi: AI;
    protected mOffsetY: number = undefined;
    protected mQueueAnimations: AnimationQueue[];
    protected mMoving: boolean = false;
    protected mRootMount: IElement;
    protected mMounts: IElement[];
    protected mDirty: boolean = false;
    protected mCreatedDisplay: boolean = false;
    protected isUser: boolean = false;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(mElementManager ? mElementManager.roomService : undefined);
        if (!sprite) {
            return;
        }
        this.mId = sprite.id;
        this.model = sprite;
    }
    showEffected(displayInfo: any) {
        throw new Error("Method not implemented.");
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel, isUser: boolean = false) {
        this.mDisplayInfo = displayInfo;
        this.isUser = isUser;
        this.loadDisplayInfo();
        this.addDisplay();
        if (!this.mCreatedDisplay) {
            this.mCreatedDisplay = true;
            this.addToBlock();
        }
    }

    public setModel(model: ISprite) {
        this.mModel = model;
        if (!model) {
            return;
        }
        // this.mDisplayInfo = this.mModel.displayInfo;
        this.mQueueAnimations = undefined;
        this.load(this.mModel.displayInfo);
        // if (!this.mDisplay) {
        //     return;
        // }
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        this.mElementManager.roomService.game.peer.render.setDisplayData(model);
        // this.mDisplay.changeAlpha(this.mModel.alpha);
        this.showNickname();
        this.setDirection(this.mModel.direction);
        // this.setRenderable(true);
        const frameModel = <IFramesModel>this.mDisplayInfo;
        if (this.mInputEnable === InputEnable.Interactive) {
            this.setInputEnable(this.mInputEnable);
        }
        // if (frameModel && frameModel.shops) {
        //     this.mShopEntity = new ShopEntity(this.mElementManager.roomService.world);
        //     this.mShopEntity.register();
        // }
        if (model.mountSprites && model.mountSprites.length > 0) {
            this.updateMounth(model.mountSprites);
        }
        this.update();
    }

    public updateModel(model: op_client.ISprite) {
        if (this.mModel.id !== model.id) {
            return;
        }
        if (this.mModel.updateAvatarSuits(model.attrs)) {
            this.mModel.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        } else if (model.hasOwnProperty("avatar")) {
            this.mModel.updateAvatar(model.avatar);
            this.load(this.mModel.displayInfo);
        }
        if (model.hasOwnProperty("attrs")) {
            this.model.updateAttr(model.attrs);
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
        if (model.hasOwnProperty("point3f")) {
            const pos = model.point3f;
            this.setPosition(new LogicPos(pos.x, pos.y, pos.z));
        }
        this.update();
    }

    scaleTween(): void {
        this.mRoomService.game.peer.render.scaleTween(this.id, this.type);
    }

    public play(animationName: string, times?: number): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Element.name}: sprite is empty`);
            return;
        }
        if (this.mModel.currentAnimationName !== animationName) {
            this.mModel.setAnimationName(animationName);
        }
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

    public update() {
        if (this.mDirty === false) {
            return;
        }
        this.mDirty = false;
        // if (this.mBubble) {
        //     this.mBubble.follow(this);
        // }
        if (this.mBlockable) {
            this.roomService.updateBlockObject(this);
        }
    }

    public move(moveData: op_client.IMoveData) {
        if (!this.mElementManager) {
            return; // Logger.getInstance().error(`Element::move - Empty element-manager.`);
        }
        this.mMoveData.arrivalTime = moveData.timestemp;
        this.mMoveData.posPath = [
            {
                x: moveData.destinationPoint3f.x,
                y: moveData.destinationPoint3f.y,
                direction: moveData.direction
            },
        ];
        this._doMove();
    }

    public movePosition(pos: LogicPos, angel: number) {
        if (!this.mElementManager) {
            return;
        }
        this.startMove();
        if (!pos.depth) pos.depth = this.getDepth();
        this.setPosition(pos, true);
        const direction = this.calculateDirectionByAngle(angel);
        if (direction !== -1 && direction !== this.model.direction) {
            this.setDirection(direction);
        }
    }

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
        this.mMoving = true;
        Logger.getInstance().log("start_walk");
        this.changeState(PlayerState.WALK);
    }

    public completeMove() {
        Logger.getInstance().log("complete_walk");
    }

    public stopMove() {
        this.mMoving = false;
        Logger.getInstance().log("stop_walk");
        this.changeState(PlayerState.IDLE);
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
        if (this.mMoving) {
            this.stopMove();
        }
        if (p) {
            this.mModel.setPosition(p.x, p.y);
            if (this.mRootMount) {
                return;
            }
            this.mElementManager.roomService.game.peer.render.setPosition(this.id, p.x, p.y);
            // this.mDisplay.setPosition(p.x, p.y, p.z);
            const depth = p.depth ? p.depth : 0;
            this.setDepth(depth);
        }
        if (!update) return;
        this.updateBlock();
        this.update();
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
        // if (!this.mDisplay || !this.model) {
        //     return;
        // }
        // if (!this.mDisplay.topPoint) {
        //     return;
        // }
        // const ratio = this.mRoomService.world.scaleRatio;
        // if (!data) {
        //     if (this.mTopDisplay)
        //         this.mTopDisplay.destroy();
        //     this.mTopDisplay = undefined;
        //     return;
        // }
        // if (!this.mTopDisplay) this.mTopDisplay = new ElementTopDisplay(this.scene, this, ratio);
        // this.mTopDisplay.loadState(data);
    }

    public removeTopDisplay() {

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

    public unmount() {
        if (this.mRootMount) {
            // 先移除避免人物瞬移
            // this.removeDisplay();
            const pos = this.mRootMount.getPosition();
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
        // ele.mount(this);
        // if (this.mDisplay) {
        //     this.mDisplay.mount(ele.getDisplay(), index);
        // }
        if (this.mMounts.indexOf(ele) === -1) {
            this.mMounts.push(ele);
        }
        return this;
    }

    public removeMount(ele: IElement) {
        ele.unmount();
        if (!this.mMounts) return this;
        // if (this.mDisplay) {
        //     this.mDisplay.unmount(ele.getDisplay());
        // }
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
        if (!this.mElementManager) this.mElementManager.roomService.game.peer.render.removeBlockObject(this.id);
        // if (this.mDisplay) {
        //     if (this.mBlockable) {
        //         this.roomService.removeBlockObject(this);
        //     }
        //     this.mDisplay.destroy();
        //     this.mDisplay = null;
        // }
        // if (this.mBubble) {
        //     this.mBubble.destroy();
        //     this.mBubble = undefined;
        // }
        // if (this.mAi) {
        //     this.mAi.destroy();
        //     this.mAi = null;
        // }
        // if (this.concomitants) {
        //     for (const ele of this.concomitants) {
        //         ele.destroy();
        //     }
        //     this.concomitants.length = 0;
        //     this.concomitants = null;
        // }
        super.destroy();
    }

    protected _doMove() {
        if (!this.mMoveData.posPath || !this.mElementManager) {
            return;
        }
        // const line = this.mMoveData.tweenLineAnim;
        // if (line) {
        //     line.stop();
        //     line.destroy();
        // }
        // const posPath = this.mMoveData.posPath;
        this.mElementManager.roomService.game.renderPeer.doMove(this.id, this.mMoveData);
        // this.mMoveData.tweenLineAnim = this.mElementManager.scene.tweens.timeline({
        //     targets: this.mDisplay,
        //     ease: "Linear",
        //     tweens: posPath,
        //     onStart: () => {
        //         this.onMoveStart();
        //     },
        //     onComplete: () => {
        //         this.onMoveComplete();
        //     },
        //     onUpdate: () => {
        //         this.onMoving();
        //     },
        //     onCompleteParams: [this],
        // });
    }

    protected createDisplay() {
        // if (!this.mDisplayInfo) {
        //     Logger.getInstance().error(`displayinfo does not exist, Create ${this.model.nickname} failed`);
        //     return;
        // }
        // if (this.mDisplay) {
        //     return this.mDisplay;
        // }
        // const scene = this.mElementManager.scene;
        // if (scene) {
        //     if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
        //         this.mDisplay = new DragonbonesDisplay(scene, this.mElementManager.roomService, this);
        //     } else {
        //         this.mDisplay = new FramesDisplay(scene, this.mElementManager.roomService, this);
        //     }
        //     const pos = this.mModel.pos;
        //     if (pos) this.mDisplay.setPosition(pos.x, pos.y, pos.z);
        //     this.addToBlock();
        // }
        // return this.mDisplay;
        // TODO
        if (!this.mDisplayInfo || !this.mElementManager) {
            return;
        }
        if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
            if (this.isUser) {
                this.mElementManager.roomService.game.peer.render.createUserDragonBones(this.mDisplayInfo as IDragonbonesModel);
            } else {
                this.mElementManager.roomService.game.peer.render.createDragonBones(this.mDisplayInfo as IDragonbonesModel);
            }
        } else {
            // (this.mDisplayInfo as IFramesModel).gene = this.mDisplayInfo.mGene;
            this.mElementManager.roomService.game.peer.render.createFramesDisplay(this.mDisplayInfo as IFramesModel);
        }
        return this;
    }

    protected loadDisplayInfo() {
        // if () {

        // }
        // this.mElementManager.roomService.game.peer.render.loadDisplayInfo(this.mDisplayInfo);
        // if (!this.mDisplayInfo) {
        //     return;
        // }
        // if (!this.mDisplay) {
        //     this.createDisplay();
        // }
        this.mRoomService.game.emitter.once("dragonBones_initialized", this.onDisplayReady, this);
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

    protected addDisplay() {
        // if (!this.mCreatedDisplay) {
        //     this.mCreatedDisplay = true;
        //     this.createDisplay();
        // }
        this.createDisplay();
        // this.mElementManager.roomService.game.peer.render.createDisplay();
        // this.createDisplay();
        // const room = this.roomService;
        // if (!room || !this.mDisplay) {
        //     // Logger.getInstance().error("roomService is undefined");
        //     return;
        // }
        // room.addToSurface(this.mDisplay);
        let depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        // if (this.mFollowObjects) {
        //     this.mFollowObjects.forEach((follow) => {
        //         if (follow.object) room.addToSceneUI(<any> follow.object);
        //     });
        // }
        this.setDepth(depth);
    }

    protected removeDisplay() {
        super.removeDisplay();
    }

    protected setDepth(depth: number) {
        if (!this.mElementManager) return;
        this.mElementManager.roomService.game.peer.render.setLayerDepth(true);
        // if (this.mDisplay) {
        //     // this.mDisplay.setDepth(depth);
        //     if (!this.roomService) {
        //         throw new Error("roomService is undefined");
        //     }
        //     const layerManager = this.roomService.layerManager;
        //     if (!layerManager) {
        //         throw new Error("layerManager is undefined");
        //     }
        //     layerManager.depthSurfaceDirty = true;
        // }
    }

    // protected onUpdateAnimationHandler() {
    // if (this.mDisplay) {
    //     this.setInputEnable(this.mInputEnable);
    // }
    // }

    // protected onMoveStart() {
    //     this.mMoving = true;
    // }

    // protected onMoveComplete() {
    //     // if (this.mMoveData.tweenLineAnim) this.mMoveData.tweenLineAnim.stop();
    //     this.stopMove();
    // }

    // protected onMoving() {
    //     const now = this.roomService.now();
    //     if (now - (this.mMoveData.tweenLastUpdate || 0) >= 50) {
    //         // let depth = 0;
    //         // if (this.model && this.model.pos) {
    //         //     depth = this.model.pos.depth ? this.model.pos.depth : 0;
    //         // }
    //         this.setDepth(0);
    //         this.mMoveData.tweenLastUpdate = now;
    //     }
    //     this.mDirty = true;
    // }

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
