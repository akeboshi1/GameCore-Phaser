import { Bodies, Body, Vector } from "tooqingmatter-js";
import { IPos, IPosition45Obj, Logger, LogicPos, Position45, Tool } from "utils";
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

    drawBody();

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

    getInteractivePositionList(): IPos[];
}
export class MatterObject implements IMatterObject {
    public _tempVec: Vector;
    public _offset: Vector;
    public _sensor: boolean = false;
    public body: Body;
    protected mModel: MatterSprite;
    protected mMoveData: MoveData = {};
    protected mCurState: string = PlayerState.IDLE;
    protected mMoving: boolean = false;
    protected mOffsetY: number = undefined;
    protected mMounts: IMatterObject[];
    protected mDirty: boolean = false;
    protected mRootMount: IMatterObject;
    protected hasPos: boolean = false;
    protected curSprite: any;
    protected _offsetOrigin: Vector;
    protected _scale: number = 0;
    constructor(public peer: PhysicalPeer, public id: number) {
        this._tempVec = Vector.create(0, 0);
        this._offset = Vector.create(0, 0);
        this._offsetOrigin = Vector.create(0.5, 0.5);
        this._scale = this.peer.scaleRatio;
    }

    get matterWorld(): MatterWorld {
        return this.peer.world;
    }

    update(time?: number, delta?: number) {
        if (this.mDirty === false && this.mMoving === false) return;
        this._doMove(time, delta);
        this.mDirty = false;
    }

    public _doMove(time?: number, delta?: number) {
        if (!this.mMoving || !this.body) {
            return;
        }
        this.checkDirection();
        const _pos = this.body.position;
        this.peer.render.setPosition(this.id, true, _pos.x, _pos.y);
        const pos = new LogicPos(_pos.x / this._scale, _pos.y / this._scale);
        this.peer.mainPeer.setPosition(this.id, pos.x, pos.y);

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
        } else {
            this.startMove();
        }
    }

    // public setMatterWorld(world: MatterWorld) {
    //     this.matterWorld = world;
    // }

    public setModel(sprite: any) {
        this.curSprite = sprite;
        this.mModel = new MatterSprite(sprite);
        if (!sprite) {
            return;
        }
        if (!this.body) {
            this.addBody();
        }
        // this.peer.world.removeFromMap(sprite);
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        if (sprite.mountSprites && sprite.mountSprites.length > 0) {
            this.updateMounth(sprite.mountSprites);
        }
        // this.matterWorld.addToMap(sprite);
        // if (sprite.mountSprites && sprite.mountSprites.length > 0) {
        //     this.updateMounth(sprite.mountSprites);
        // }
        // this.peer.world.addToMap(sprite);
    }

    public updateModel(model: any) {
        if (!this.mModel || this.mModel.id !== model.id) {
            return;
        }
        if (!this.curSprite) this.curSprite = {};
        Object.assign(this.curSprite, model);
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
        // this.matterWorld.addToMap(this.mModel);
        this.update();
        // this.peer.world.addToMap(this.mModel);
    }

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
        if (!this.mMoveData || !this.mModel) {
            return;
        }
        const path = this.mMoveData.path;
        if (!path || path.length < 1) {
            return;
        }
        // this.changeState(PlayerState.WALK);
        this.mMoving = true;
        // this.setStatic(false);
        const pos = this.getPosition();
        // pos.y += this.offsetY;
        const angle = Math.atan2(path[0].y * this._scale - pos.y, path[0].x * this._scale - pos.x);
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
        // this.setStatic(true);
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
        this._tempVec.x = this.body.position.x;
        this._tempVec.y = this.body.position.y;
        Body.applyForce(this.body, this._tempVec, force);
        return this;
    }

    public setVelocityX() {
        if (!this.body) return;
        Body.setVelocity(this.body, this._tempVec);
    }

    public setVelocityY() {
        if (!this.body) return;
        Body.setVelocity(this.body, this._tempVec);
    }

    public setVelocity(x: number, y: number) {
        if (!this.body) {
            // render todo setVelocity
            return;
        }
        x *= this._scale;
        y *= this._scale;
        // Logger.getInstance().debug("#move body.setVelocity ====>", x, y);
        Body.setVelocity(this.body, Vector.create(x, y));
       //  Body.setInertia(this.body, Infinity);
    }

    public setPosition(p: IPos, update: boolean = false) {
        if (this.mMoving) {
            this.stopMove();
        }
        this._tempVec.x = p.x;
        this._tempVec.y = p.y;
        this.mModel.setPosition(p.x, p.y);
        this.peer.mainPeer.setPosition(this.id, update, p.x, p.y);
        this.peer.render.setPosition(this.id, p.x, p.y);
        if (!this.body) {
            this.hasPos = true;
            // ==== todo render setPositon
            return;
        }
        // tslint:disable-next-line:no-console
        // console.log("tryStopMove matter.object position ======>", this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y);
        // todo
        Body.setPosition(this.body, Vector.create(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y));
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
            this.addBody();
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
        this.body = body;
        body.isSensor = this._sensor;
        // if (this.hasPos) {
        //     this.hasPos = false;
        //     Body.setPosition(this.body, Vector.create(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y));
        // }
        if (addToWorld) {
            this.matterWorld.add(body, this._sensor, this);
        }
    }

    public setBody() {
        this.drawBody();
    }

    public addBody() {
        this.setBody();
    }

    public removeBody() {
        if (!this.body || !this.matterWorld) {
            return;
        }
        this.matterWorld.remove(this.body, true);
    }

    public setVertices(vertexSets) {
        return Bodies.fromVertices(this._tempVec.x, this._tempVec.y, vertexSets, { isStatic: true, inertia: Infinity, frictionAir: 0, inverseInertia: Infinity });
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

    public getInteractivePositionList(): IPos[] {
        const interactives = this.mModel.getInteractive();
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

    public async drawBody() {
        if (!this.mModel || !this.matterWorld) return;
        const collision = this.mModel.getCollisionArea();
        let body;
        if (!collision) {
            body = Bodies.circle(this._tempVec.x * this._scale, this._tempVec.y * this._scale, 10);
            this.setExistingBody(body, true);
            return;
        }
        const collisionArea = [...collision];
        let walkableArea = this.mModel.getWalkableArea();
        if (!walkableArea) {
            walkableArea = [];
        }

        const cols = collisionArea.length;
        const rows = collisionArea[0].length;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (walkableArea[i] && walkableArea[i][j] === 1) {
                    collisionArea[i][j] = 0;
                }
            }
        }

        const walkable = (val: number) => val === 0;

        const resule = collisionArea.some((val: number[]) => val.some(walkable));
        // const transformToMini90 = this.mRoomService.transformToMini90.bind(this.mRoomService);
        let paths = [];
        const miniSize = this.matterWorld.miniSize;
        if (resule) {
            paths[0] = this.calcBodyPath(collisionArea, miniSize);
        } else {
            paths = [[Position45.transformTo90(new LogicPos(0, 0), miniSize), Position45.transformTo90(new LogicPos(rows, 0), miniSize), Position45.transformTo90(new LogicPos(rows, cols), miniSize), Position45.transformTo90(new LogicPos(0, cols), miniSize)]];
        }

        const mapHeight = (rows + cols) * (miniSize.tileHeight / 2) * this._scale;
        const mapWidth = (rows + cols) * (miniSize.tileWidth / 2) * this._scale;
        const scaleDpr = (pos) => {
            pos.x *= this._scale;
            pos.y *= this._scale;
        };
        paths.map((path) => path.map(scaleDpr));
        if (paths.length < 1 || paths[0].length < 3) {
            return;
        }
        // const paths = [{ x: 0, y: -height / 2 }, { x: width / 2, y: 0 }, { x: 0, y: height / 2 }, { x: -width / 2, y: 0 }];
        const curOrigin = this.mModel.getOriginPoint();
        const originPos = new LogicPos(curOrigin.x, curOrigin.y);
        const origin = Position45.transformTo90(originPos, miniSize);
        origin.x *= this._scale;
        origin.y *= this._scale;

        // this._offset.x = origin.x;
        // this._offset.y = mapHeight * 0.5 - origin.y;
        this._offset.x = mapWidth * this._offsetOrigin.x - (cols * (miniSize.tileWidth / 2) * this._scale) - origin.x;
        this._offset.y = mapHeight * this._offsetOrigin.y - origin.y;
        body = Bodies.fromVertices(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y, paths, { isStatic: true, friction: 0, frictionAir: 0 });
        this.setExistingBody(body, true);
    }

    protected calcBodyPath(collisionArea: number[][], miniSize: IPosition45Obj) {
        const allpoints = this.prepareVertices(collisionArea).reduce((acc, p) => acc.concat(this.transformBodyPath2(p[1], p[0], miniSize)), []);
        // console.log(allpoints);
        const convexHull = require("monotone-convex-hull-2d");
        const resultIndices = convexHull(allpoints);

        return resultIndices.map((i) => ({ x: allpoints[i][0], y: allpoints[i][1] }));
        //    return paths;
    }

    private prepareVertices(collisionArea: number[][]): any[] {
        const allpoints = [];
        for (let i = 0; i < collisionArea.length; i++) {
            let leftMost, rightMost;
            for (let j = 0; j < collisionArea[i].length; j++) {
                if (collisionArea[i][j] === 1) {
                    if (!leftMost) {
                        leftMost = [i, j];
                        allpoints.push(leftMost);
                    } else {
                        rightMost = [i, j];
                    }
                }
            }
            if (rightMost) {
                allpoints.push(rightMost);
            }
        }
        return allpoints;
    }

    private transformBodyPath(x: number, y: number, miniSize: IPosition45Obj) {
        const pos = Position45.transformTo90(new LogicPos(x, y), miniSize);
        return [{ x: pos.x, y: -miniSize.tileHeight * 0.5 + pos.y }, { x: pos.x + miniSize.tileWidth * 0.5, y: pos.y }, { x: pos.x, y: pos.y + miniSize.tileHeight * 0.5 }, { x: pos.x - miniSize.tileWidth * 0.5, y: pos.y }];
    }

    private transformBodyPath2(x: number, y: number, miniSize: IPosition45Obj) {
        const pos = Position45.transformTo90(new LogicPos(x, y), miniSize);
        const result = [[pos.x, -miniSize.tileHeight * 0.5 + pos.y], [pos.x + miniSize.tileWidth * 0.5, pos.y], [pos.x, pos.y + miniSize.tileHeight * 0.5], [pos.x - miniSize.tileWidth * 0.5, pos.y]];
        return result;
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
