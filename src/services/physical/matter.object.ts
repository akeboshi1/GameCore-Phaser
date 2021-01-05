import { Bodies, Body, Vector } from "matter-js";
import { IPos, LogicPos, Position45, Tool } from "utils";
import { delayTime, PhysicalPeer } from "../physical.worker";
import { MatterWorld } from "./matter.world";
import { MoveData, MovePos } from "./matter.player.object";
import { op_client } from "pixelpai_proto";
import { PlayerState } from "structure";
import { MatterSprite } from "./matter.sprite";
export interface IMatterObject {
    id: number;

    model: MatterSprite;

    body: Body;

    _sensor: boolean;

    _offset: Vector;

    setStatic(boo: boolean);

    applyForce(boo: boolean);

    setVelocityX();

    setVelocityY();

    setVelocity(x: number, b: number);

    changeState(state: string, times?: number);

    // setMatterWorld(world: MatterWorld);

    setExistingBody(body: Body, addToWorld?: boolean);

    update(time?: number, delta?: number);

    setModel(sprite: op_client.ISprite);

    updateModel(sprite: any);

    updateAnimations(displayInfo: any);

    setPosition(p: IPos, update: boolean): void;

    getPosition(): IPos;

    startMove();

    stopMove();

    // turn();

    destroy();

    setBody(scaleRatio: number);

    addBody(scaleRatio: number);

    removeBody();

    setVertices(vertexSets: any);

    // setQueue(queue: any);

    _doMove(time?: number, delta?: number);

    // setQueue(queue: any);

    move(moveData: MovePos[]);

    moveMotion(x: number, y: number);

    mount(ele: IMatterObject): this;

    unmount(targetPos?: IPos): Promise<void> | undefined;

    addMount(ele: IMatterObject, index?: number): this;

    removeMount(ele: IMatterObject, targetPos?: IPos): Promise<void>;

    getInteractivePositionList(): Promise<IPos[]>;
}
export class MatterObject implements IMatterObject {
    public _tempVec2: Vector;
    public _offset: Vector;
    public _sensor: boolean = false;
    public body: Body;
    protected mModel: MatterSprite;
    // protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mMoveData: MoveData = {};
    protected mCurState: string = PlayerState.IDLE;
    protected mMoving: boolean = false;
    // protected mAnimationName: string = "";
    // protected mCurAnimationName: RunningAnimation;
    protected mOffsetY: number = undefined;
    // protected mQueueAnimations: AnimationQueue[];
    protected mMounts: IMatterObject[];
    protected mDirty: boolean = false;
    protected mRootMount: IMatterObject;
    protected hasPos: boolean = false;
    constructor(public peer: PhysicalPeer, public id: number) {
        this._tempVec2 = Vector.create(0, 0);
        this._offset = Vector.create(0, 0);
    }

    get matterWorld(): MatterWorld {
        return this.peer.world;
    }

    update(time?: number, delta?: number) {
        if (this.mDirty === false && this.mMoving === false) return;
        this._doMove(time, delta);
        this.mDirty = false;
    }

    // public setMatterWorld(world: MatterWorld) {
    //     this.matterWorld = world;
    // }

    public setModel(sprite: any) {
        this.mModel = new MatterSprite(sprite);
        if (!sprite) {
            return;
        }
        // this.peer.world.removeFromMap(sprite);
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        if (sprite.mountSprites && sprite.mountSprites.length > 0) {
            this.updateMounth(sprite.mountSprites);
        }
        // if (sprite.mountSprites && sprite.mountSprites.length > 0) {
        //     this.updateMounth(sprite.mountSprites);
        // }
        // this.peer.world.addToMap(sprite);
    }

    public updateModel(model: any) {
        if (!this.mModel || this.mModel.id !== model.id) {
            return;
        }
        //  this.peer.world.removeFromMap(this.mModel);
        if (model.hasOwnProperty("animations")) {
            this.mModel.updateAnimations(model.animations);
        }
        if (model.hasOwnProperty("point3f")) {
            const pos = model.point3f;
            this.setPosition(new LogicPos(pos.x, pos.y, pos.z));
        }
        if (model.hasOwnProperty("pos")) {
            const pos = model.pos;
            this.setPosition(new LogicPos(pos.x, pos.y, pos.z));
        }
        if (model.hasOwnProperty("mountSprites")) {
            const mounts = model.mountSprites;
            this.mergeMounth(mounts);
            this.updateMounth(mounts);
        }
        this.update();
        // this.peer.world.addToMap(this.mModel);
    }

    public updateAnimations(displayInfo: any) {
        if (!this.mModel || this.mModel.id !== displayInfo.id) {
            return;
        }
        if (displayInfo.hasOwnProperty("animations")) {
            this.mModel.updateAnimations(displayInfo.animations);
        }
        if (displayInfo.hasOwnProperty("pos")) {
            const pos = displayInfo.pos;
            this.setPosition(new LogicPos(pos.x, pos.y, pos.z));
        }
    }

    public startMove() {
        if (!this.mMoveData) {
            return;
        }
        const path = this.mMoveData.path;
        if (!path || path.length < 1) {
            return;
        }
        // this.changeState(PlayerState.WALK);
        this.mMoving = true;
        this.setStatic(false);
        const pos = this.getPosition();
        // pos.y += this.offsetY;
        const angle = Math.atan2(path[0].y - pos.y, path[0].x - pos.x);
        const speed = this.mModel.speed * delayTime;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    public stopMove() {
        this.mMoving = false;
        if (this.mMoveData && this.mMoveData.posPath) {
            delete this.mMoveData.posPath;
            if (this.mMoveData.arrivalTime) this.mMoveData.arrivalTime = 0;
            if (this.mMoveData.tweenLineAnim) {
                this.mMoveData.tweenLineAnim.stop();
                this.mMoveData.tweenLineAnim.destroy();
            }
        }
        this.changeState(PlayerState.IDLE);
        if (!this.body) return;
        this.setVelocity(0, 0);
        this.setStatic(true);
    }

    // public changeState(val?: string, times?: number) {
    //     if (this.mCurState === val) return;
    //     if (!val) {
    //         val = PlayerState.IDLE;
    //     }
    //     if (this.mCheckStateHandle(val)) {
    //         this.mCurState = val;
    //         // this.mModel.setAnimationName(this.mCurState, times);
    //         const id = this.mModel.id;
    //         this.peer.render.playAnimation(id, this.mCurState, undefined, times);
    //     }
    // }

    /**
     * 设置object是否是静态物件受力是否可移动
     * @param value
     */
    public setStatic(value: boolean) {
        if (this.body) {
            Body.setStatic(this.body, value);
        }
        return this;
    }

    public isStatic(): boolean {
        return this.body.isStatic;
    }

    public applyForce(force) {
        if (!this.body) return;
        this._tempVec2.x = this.body.position.x;
        this._tempVec2.y = this.body.position.y;
        Body.applyForce(this.body, this._tempVec2, force);
        return this;
    }

    public setVelocityX() {
        if (!this.body) return;
        Body.setVelocity(this.body, this._tempVec2);
    }

    public setVelocityY() {
        if (!this.body) return;
        Body.setVelocity(this.body, this._tempVec2);
    }

    public setVelocity(x: number, y: number) {
        if (!this.body) {
            // render todo setVelocity
            return;
        }
        x *= this.peer.scaleRatio;
        y *= this.peer.scaleRatio;

        Body.setVelocity(this.body, Vector.create(x, y));
    }

    public setPosition(p: IPos, update: boolean = false) {
        if (this.mMoving) {
            this.stopMove();
        }
        this._tempVec2.x = p.x;
        this._tempVec2.y = p.y;
        this.peer.mainPeer.setPosition(this.id, update, p.x, p.y);
        this.peer.render.setPosition(this.id, p.x, p.y);
        if (!this.body) {
            this.hasPos = true;
            // ==== todo render setPositon
            return;
        }
        const scale = this.peer.scaleRatio;
        Body.setPosition(this.body, Vector.create(this._tempVec2.x * scale + this._offset.x, this._tempVec2.y * scale + this._offset.y));
    }

    public getPosition(): IPos {
        const pos: IPos = this.mModel && this.mModel.pos ? this.mModel.pos : new LogicPos(0, 0);
        return pos;
    }

    // public completeAnimationQueue() {
    //     const anis = this.model.animationQueue;
    //     if (!anis || anis.length < 1) return;
    //     let aniName: string = PlayerState.IDLE;
    //     let playTiems;
    //     if (anis.length > 0) {
    //         aniName = anis[0].name;
    //         playTiems = anis[0].playTimes;
    //     }
    //     this.play(aniName, playTiems);
    //     anis.shift();
    // }

    public destroy() {
        this.removeBody();
        this.body = undefined;
    }

    public mount(root: IMatterObject) {
        this.mRootMount = root;
        if (this.mMoving) {
            this.stopMove();
        }
        // this.peer.mainPeer.disableBlock(this.id);
        // this.disableBlock();
        this.removeBody();
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
            // this.peer.mainPeer.enableBlock(this.id);
            this.addBody(this.peer.scaleRatio);
            this.mDirty = true;
        }
        return Promise.resolve();
    }

    public addMount(ele: IMatterObject, index?: number) {
        if (!this.mMounts) this.mMounts = [];
        ele.mount(this);
        if (this.mMounts.indexOf(ele) === -1) {
            this.mMounts.push(ele);
        }
        return this;
    }

    public async removeMount(ele: IMatterObject, targetPos?: IPos) {
        await ele.unmount(targetPos);
        const index = this.mMounts.indexOf(ele);
        if (index > -1) {
            this.mMounts.splice(index, 1);
        }
        // await this.peer.render.unmount(this.id, ele.id);
        await this.peer.mainPeer.removeMount(this.id, ele.id, targetPos);
        return Promise.resolve();
    }

    public setExistingBody(body: Body, addToWorld?: boolean) {
        if (addToWorld === undefined) {
            addToWorld = true;
        }

        if (this.body) {
            // ====todo no remove
            this.matterWorld.remove(this.body, true);
        }
        const sensor = this.getSensor();
        this.body = body;
        body.isSensor = this._sensor;
        if (this.hasPos) {
            this.hasPos = false;
            const scale = this.peer.scaleRatio;
            Body.setPosition(this.body, Vector.create(this._tempVec2.x * scale + this._offset.x, this._tempVec2.y * scale + this._offset.y));
        }
        if (addToWorld) {
            this.matterWorld.add(body, this._sensor, this);
        }
    }

    public setBody(scaleRatio: number) {
        const body = Bodies.circle(this._tempVec2.x * scaleRatio, this._tempVec2.y * scaleRatio, 10);
        this.setExistingBody(body, true);
    }

    public addBody(scaleRatio: number) {
        this.setBody(scaleRatio);
    }

    public removeBody() {
        if (!this.body) {
            return;
        }
        this.matterWorld.remove(this.body, true);
    }

    public setVertices(vertexSets) {
        return Bodies.fromVertices(this._tempVec2.x, this._tempVec2.y, vertexSets, { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
    }

    public getSensor() {
        return this._sensor;
    }

    public changeState(state, number: number = 1) { }

    public moveMotion(x: number, y: number) {
    }

    public move(path: MovePos[]) {
        this.mMoveData.path = path;
        this.startMove();
    }

    public async getInteractivePositionList(): Promise<IPos[]> {
        const interactives = await this.peer.mainPeer.framesModel_getInteractive(this.id);
        if (!interactives || interactives.length < 1) {
            return;
        }
        const mini45 = this.matterWorld.miniSize;
        // const pos45 = this.matterWorld.transformToMini45(this.getPosition());
        const pos45 = Position45.transformTo45(this.getPosition(), mini45);
        const result: IPos[] = [];
        for (const interactive of interactives) {
            if (this.peer.isWalkableAt(pos45.x + interactive.x, pos45.y + interactive.y)) {
                result.push(Position45.transformTo90(new LogicPos(pos45.x + interactive.x, pos45.y + interactive.y), mini45));
            }
        }
        return result;
    }

    // public setDirection(val: number) {
    //     if (this.model && !this.model.currentAnimationName) {
    //         this.model.currentAnimationName = PlayerState.IDLE;
    //     }
    //     if (this.model) {
    //         this.model.setDirection(val);
    //         // this.mDisplay.play(this.model.currentAnimation);
    //     }
    //     this.play(this.model.currentAnimationName);
    // }

    // public getDirection(): number {
    //     return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    // }

    // public turn(): void {
    //     if (!this.mModel) {
    //         return;
    //     }
    //     this.mModel.turn();
    //     this.play(this.model.currentAnimationName);
    //     // if (this.mDisplay) this.mDisplay.play(this.mModel.currentAnimation);
    // }

    // public play(animationName: string, times?: number): void {
    //     if (!this.mModel) {
    //         Logger.getInstance().error(`${Element.name}: sprite is empty`);
    //         return;
    //     }
    //     //  this.mCurAnimationName = animationName;
    //     this.mModel.setAnimationName(animationName);

    //     if (times !== undefined) {
    //         times = times > 0 ? times - 1 : -1;
    //     }
    //     this.peer.render.playAnimation(this.id, this.mCurAnimationName, undefined, times);
    // }

    // public setQueue(animations: any) {
    //     if (!this.mModel) {
    //         return;
    //     }
    //     const queue = [];
    //     for (const animation of animations) {
    //         const aq: AnimationQueue = {
    //             name: animation.animationName,
    //             playTimes: animation.times,
    //         };
    //         // if (animation.times > 0) {
    //         //     aq.complete = () => {
    //         //         const anis = this.model.animationQueue;
    //         //         anis.shift();
    //         //         let aniName: string = PlayerState.IDLE;
    //         //         let playTiems;
    //         //         if (anis.length > 0) {
    //         //             aniName = anis[0].name;
    //         //             playTiems = anis[0].playTimes;
    //         //         }
    //         //         this.play(aniName, playTiems);
    //         //         // const aniName = anis.length > 0 ? anis[0].name : PlayerState.IDLE;
    //         //     };
    //         // }
    //         queue.push(aq);
    //     }
    //     this.mModel.setAnimationQueue(queue);
    //     if (queue.length > 0) {
    //         this.play(animations[0].animationName, animations[0].times);
    //     }
    // }

    public mergeMounth(mounts: number[]) {
        const oldMounts = this.mModel.mountSprites || [];
        for (const id of oldMounts) {
            if (mounts.indexOf(id) === -1) {
                const ele = this.peer.getMatterObj(id);
                if (ele) {
                    this.removeMount(ele);
                }
            }
        }
    }

    public updateMounth(mounts: number[]) {
        if (mounts.length > 0) {
            for (let i = 0; i < mounts.length; i++) {
                const ele = this.peer.getMatterObj(mounts[i]);
                if (ele) {
                    this.addMount(ele, i);
                }
            }
        }
        this.mModel.mountSprites = mounts;
    }

    public _doMove(time?: number, delta?: number) {
        if (!this.mMoving || !this.body) {
            return;
        }
        const scaleRatio: number = this.peer.scaleRatio;
        const _pos = this.body.position;
        const pos = new LogicPos(_pos.x / scaleRatio, _pos.y / scaleRatio);
        this.peer.mainPeer.setPosition(this.id, true, pos.x, pos.y);
        this.peer.render.setPosition(this.id, pos.x, pos.y);

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
                    this.peer.mainPeer.setDirection(this.id, path[0].stopDir);
                }
            }
        }
    }

    public checkDirection() {
    }

    public onCheckDirection(params: any): number {
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

    public loadDisplayInfo() {
        this.peer.emitter.once("dragonBones_initialized", this.onDisplayReady, this);
    }

    get model(): any {
        return this.mModel;
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }

    private onDisplayReady() {
        this.peer.render.displayReady(this.id, this.model.currentAnimation);
        // if (this.mModel.mountSprites && this.mModel.mountSprites.length > 0) {
        //     this.updateMounth(this.mModel.mountSprites);
        // }
    }
}
