import { Bodies, Body, Vector, Events } from "tooqingmatter-js";
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

    setBaseVelocity(x: number, y: number);

    setVelocity(x: number, y: number);

    changeState(state: string, times?: number);

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

    _doMove(time?: number, delta?: number);

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
    protected endMove: boolean = false;
    protected mRootMount: IMatterObject;
    protected hasPos: boolean = false;
    protected curSprite: any;
    protected _offsetOrigin: Vector;
    protected _scale: number = 0;
    protected mTargetPos;
    private mMoveDelayTime = 400;
    private mMoveTime: number = 0;
    private mMovePoints: any[];
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
        if (!this.mMoving || !this.body) return;
        const _pos = this.body.position;
        const _prePos = this.body.positionPrev;
        if ((this.mDirty === false || !this.peer) && (Math.round(_pos.x) === Math.round(_prePos.x) && Math.round(_pos.y) === Math.round(_prePos.y))) return;
        this._doMove(time, delta);
        if (this.mMovePoints && this.mMovePoints.length > 0 && !this.endMove) {
            this._pushMoveData();
        }
        this.mDirty = false;
    }

    public _pushMoveData() {
        const now = new Date().getTime();
        if (!this.mMovePoints || this.mMovePoints.length < 1) {
            this.mMoveTime = now;
            return;
        }
        if (now - this.mMoveTime > this.mMoveDelayTime) {
            this.peer.mainPeer.pushMovePoints(this.id, this.mMovePoints);
            this.mMovePoints.length = 0;
            this.mMovePoints = undefined;
            this.mMoveTime = now;
        }
    }

    public _doMove(time?: number, delta?: number) {
        if (!this.mMoving || !this.body) {
            return;
        }
        this.checkDirection();
        const _pos = this.body.position;
        const pos = new LogicPos(_pos.x / this._scale, _pos.y / this._scale);
        const path = this.mMoveData.path;
        this.peer.render.setPosition(this.id, pos.x, pos.y);
        this.peer.mainPeer.setPosition(this.id, true, pos.x, pos.y);
        if (!path) {
            if (!this.mMovePoints) {
                this.mMovePoints = [];
                // this.peer.mainPeer.requestPushBox(this.id);
            }
            this.mMovePoints.push(pos);
            // 当物理对象停止时，监听到停止事件的状态
            if (this.endMove && this.matterWorld.matterUser.stopBoxMove) {
                this.tryStopMove({ x: pos.x, y: pos.y });
                this.endMove = false;
                this.matterWorld.matterUser.stopBoxMove = false;
                return;
            }
            return;
        }
        const speed = this.mModel.speed * delta;
        if (Tool.twoPointDistance(pos, path[0].pos) <= speed) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
            } else {
                this.stopMove();
            }
        } else {
            this.startMove();
        }
    }

    public setModel(sprite: any) {
        this.curSprite = sprite;
        this.mModel = new MatterSprite(sprite);
        if (!sprite) {
            return;
        }
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        if (sprite.mountSprites && sprite.mountSprites.length > 0) {
            this.updateMounth(sprite.mountSprites);
        }
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
        this.update();
    }

    public mergeMounth(mounts: number[]) {
        const oldMounts = this.mModel.mountSprites || [];
        for (const id of oldMounts) {
            if (mounts.indexOf(id) === -1) {
                if (!id) continue;
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
        const pos = this.getPosition();
        const angle = Math.atan2(path[0].pos.y * this._scale - pos.y, path[0].pos.x * this._scale - pos.x);
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
    }

    public tryStopMove(pos?: IPos) {
        this.mMoving = false;
        if (!this.body) return;
        this.setVelocity(0, 0);
        if (!this.mMovePoints) return;
        if (pos) {
            const tmpPos = { x: Math.round(pos.x / this.peer.scaleRatio), y: Math.round(pos.y / this.peer.scaleRatio) };
            if (this.mModel) this.mModel.setPosition(tmpPos.x, tmpPos.y);
            this._tempVec.x = pos.x;
            this._tempVec.y = pos.y;
            Body.setPosition(this.body, Vector.create(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y));
            this.mMovePoints.push(tmpPos);
            this.peer.mainPeer.tryStopElementMove(this.id, this.mMovePoints);
            this.mMovePoints.length = 0;
            this.mMovePoints = undefined;
        }
    }

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
            return;
        }
        if (!x && !y) {
            this.mMoving = false;
        } else {
            this.mMoving = true;
        }
        x *= this._scale;
        y *= this._scale;
        Body.setVelocity(this.body, Vector.create(x, y));
        // 设置碰撞体是否旋转
        Body.setInertia(this.body, Infinity);
    }

    public setBaseVelocity(x: number, y: number) {
        if (!this.body) {
            return;
        }
        if (!x && !y) {
            this.mMoving = false;
        } else {
            this.mMoving = true;
            Body.setVelocity(this.body, Vector.create(x, y));
        }
        this.setStatic(!this.mMoving);
        // 设置碰撞体是否旋转
        Body.setInertia(this.body, Infinity);
    }

    public setPosition(p: IPos, update: boolean = false) {
        if (this.mMoving) {
            this.stopMove();
        }
        this._tempVec.x = p.x;
        this._tempVec.y = p.y;
        if (this.mModel) this.mModel.setPosition(p.x, p.y);
        this.peer.mainPeer.setPosition(this.id, update, p.x, p.y);
        this.peer.render.setPosition(this.id, p.x, p.y);
        if (!this.body) {
            this.hasPos = true;
            // ==== todo render setPositon
            return;
        }
        // todo
        Body.setPosition(this.body, Vector.create(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y));
    }

    public getPosition(): IPos {
        const pos: IPos = this.mModel && this.mModel.pos ? this.mModel.pos : new LogicPos(0, 0);
        return pos;
    }

    public destroy() {
        this.removeBody();
        Events.off(this.peer.world.engine, "collisionStart");
        Events.off(this.peer.world.engine, "collisionEnd");
        this.body = undefined;
    }

    public mount(root: IMatterObject) {
        this.mRootMount = root;
        if (this.mMoving) {
            this.stopMove();
        }
        this.removeBody();
        this.mDirty = true;
        return this;
    }

    public unmount() {
        if (this.mRootMount) {
            const pos = this.mRootMount.getPosition();
            this.mRootMount = null;
            this.setPosition(pos, true);
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
        Events.on(this.peer.world.engine, "collisionStart", (event) => {
            const pairs = event.pairs;
            if (!pairs) return;
            const len = pairs.length;
            for (let i: number = 0; i < len; i++) {
                const pair = pairs[i];
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                if (bodyA === this.body || bodyB === this.body) {
                    if (!this.mModel || !this.mModel.eventName || this.mModel.eventName.length < 1) {
                        continue;
                    }
                    this.peer.mainPeer.requestPushBox(this.id);
                    this.mMoving = true;
                    return;
                }
            }
        });
        Events.on(this.peer.world.engine, "collisionEnd", (event) => {
            const pairs = event.pairs;
            if (!pairs) return;
            const len = pairs.length;
            for (let i: number = 0; i < len; i++) {
                const pair = pairs[i];
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                if (bodyA === this.body || bodyB === this.body) {
                    this.endMove = true;
                    return;
                }
            }
        });
        body.isSensor = this._sensor;
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
        let body;
        if (!this.mModel || !this.mModel.eventName) {
            body = Bodies.fromVertices(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y, vertexSets, { isStatic: true, friction: 0, frictionAir: 0, inertia: Infinity, inverseInertia: Infinity });
        } else {
            body = Bodies.fromVertices(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y, vertexSets, { isStatic: true, friction: 0.4, frictionAir: 1, inertia: Infinity, inverseInertia: Infinity, restitution: 0 });
        }
        return body;
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
        const curOrigin = this.mModel.getOriginPoint();
        const originPos = new LogicPos(curOrigin.x, curOrigin.y);
        const origin = Position45.transformTo90(originPos, miniSize);
        origin.x *= this._scale;
        origin.y *= this._scale;

        this._offset.x = mapWidth * this._offsetOrigin.x - (cols * (miniSize.tileWidth / 2) * this._scale) - origin.x;
        this._offset.y = mapHeight * this._offsetOrigin.y - origin.y;
        if (!this.mModel.eventName) {
            body = Bodies.fromVertices(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y, paths, { isStatic: true, friction: 0, frictionAir: 0, inertia: Infinity, inverseInertia: Infinity });
        } else {
            body = Bodies.fromVertices(this._tempVec.x * this._scale + this._offset.x, this._tempVec.y * this._scale + this._offset.y, paths, { isStatic: true, friction: 0.4, frictionAir: 1, inertia: Infinity, inverseInertia: Infinity, restitution: 0 });
        }
        this.setExistingBody(body, true);
    }

    protected calcBodyPath(collisionArea: number[][], miniSize: IPosition45Obj) {
        const allpoints = this.prepareVertices(collisionArea).reduce((acc, p) => acc.concat(this.transformBodyPath2(p[1], p[0], miniSize)), []);
        const convexHull = require("monotone-convex-hull-2d");
        const resultIndices = convexHull(allpoints);
        return resultIndices.map((i) => ({ x: allpoints[i][0], y: allpoints[i][1] }));
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
}
