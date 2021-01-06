import { Bodies, Body, Vector } from "matter-js";
import { IPos } from "utils";
import { IRoomService } from "../room/room";
import { MatterWorld } from "./matter.world";

export class MatterObject {
    protected body: Body;
    protected matterWorld: MatterWorld;
    protected _tempVec: Vector;
    protected _offset: Vector;
    protected _sensor: boolean = false;
    protected _offsetOrigin: Vector;
    protected _radio: number = 0;
    constructor(protected mRoomService: IRoomService) {
        if (this.mRoomService) this.setMatterWorld(mRoomService.matterWorld);
        this._tempVec = Vector.create(0, 0);
        this._offset = Vector.create(0, 0);
        this._offsetOrigin = Vector.create(0.5, 0.5);
    }

    public setMatterWorld(world: MatterWorld) {
        if (!this._radio) this._radio = this.mRoomService.game.scaleRatio;
        this.matterWorld = world;
    }

    public setStatic(value: boolean) {
        if (this.body) {
            // 重复设置会拿到错误的inertia导致position为NaN
            if (value === this.body.isStatic) {
                return this;
            }
            Body.setStatic(this.body, value);
        }
        return this;
    }

    public isStatic(): boolean {
        return this.body.isStatic;
    }

    public applyForce(force) {
        // this._tempVec2.set(this.body.position.x, this.body.position.y);
        this._tempVec.x = this.body.position.x;
        this._tempVec.y = this.body.position.y;

        Body.applyForce(this.body, this._tempVec, force);

        return this;
    }

    public setVelocityX(x: number) {
        // this._tempVec2.x = this.body.velocity.x;
        Body.setVelocity(this.body, this._tempVec);
    }

    public setVelocityY(y: number) {
        // this._tempVec2.y = this.body.velocity.y;
        Body.setVelocity(this.body, this._tempVec);
    }

    public setVelocity(x: number, y: number) {
        // this._tempVec2.x = this.body.velocity.x;
        // this._tempVec2.y = this.body.velocity.y;
        x *= this._radio;
        y *= this._radio;
        if (!this.body) {
            return;
        }
        Body.setVelocity(this.body, Vector.create(x, y));
        Body.setInertia(this.body, Infinity);
    }

    public setPosition(pos: IPos) {
        // if (x === undefined) { x = 0; }
        // if (y === undefined) { y = x; }

        this._tempVec.x = pos.x; // + this._offset.x;
        this._tempVec.y = pos.y; // + this._offset.y;

        if (!this.body) {
            return;
        }

        Body.setPosition(this.body, Vector.create(this._tempVec.x * this._radio + this._offset.x, this._tempVec.y * this._radio + this._offset.y));
    }

    public destroy() {
        this.removeBody();
        this.body = undefined;
    }

    protected setBody() {
        const body = Bodies.circle(this._tempVec.x * this._radio, this._tempVec.y * this._radio, 10);
        // this.body = this.setVertices(verteSets);
        this.setExistingBody(body, true);
    }

    protected addBody() {
        if (this.body) {
            this.setExistingBody(this.body);
            return;
        }
        this.setBody();
    }

    protected removeBody() {
        if (!this.body) {
            return;
        }
        this.matterWorld.remove(this.body, true);
    }

    protected setVertices(vertexSets) {
        return Bodies.fromVertices(this._tempVec.x * this._radio, this._tempVec.y * this._radio, vertexSets, { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
        // return Bodies.fromVertices(0, 0, vertexSets, { isStatic: false });
    }

    protected setExistingBody(body: Body, addToWorld?: boolean) {
        if (!this.matterWorld) {
            return;
        }
        if (addToWorld === undefined) {
            addToWorld = true;
        }

        if (this.body) {
            this.matterWorld.remove(this.body, true);
        }
        const sensor = this.getSensor();
        this.body = body;
        body.isSensor = this._sensor;

        if (addToWorld) {
            this.matterWorld.add(body, this._sensor, this);
        }
    }

    protected getSensor() {
        return false;
    }
}
