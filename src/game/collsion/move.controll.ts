import * as SAT from "sat";
import { IPos, LogicPos, Logger } from "utils";
import { CollsionManager } from "./collsion.manager";
export class MoveControll {

    protected mBodies: SAT.Polygon;
    private ignoreCollsion: boolean = false;
    private velocity: IPos;
    private mPosition: IPos;
    private mPrePosition: IPos;

    constructor(private id: number, private collsion: CollsionManager) {
        this.mPosition = new LogicPos();
        this.mPrePosition = new LogicPos();
        this.velocity = new LogicPos();
    }

    setVelocity(x: number, y: number) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    update(time: number, delta: number) {
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.mPrePosition.x = this.mPosition.x;
            this.mPrePosition.y = this.mPosition.y;

            const pos = this.mBodies ? this.mBodies.pos : this.mPosition;
            pos.x = this.mPosition.x + this.velocity.x;
            pos.y = this.mPosition.y + this.velocity.y;

            const collideResponses = this.getCollideResponses();
            const collideCount = collideResponses.length;
            // 碰到多个分离后，可能会和其他相交
            if (collideCount === 1) {
                pos.x -= collideResponses[0].overlapV.x;
                pos.y -= collideResponses[0].overlapV.y;
            } else if (collideCount > 1) {
                pos.x = this.mPosition.x;
                pos.y = this.mPosition.y;
                return;
            }

            this.mPosition.x = pos.x;
            this.mPosition.y = pos.y;
        }
    }

    setPosition(pos: IPos) {
        if (this.mPosition) {
            this.mPrePosition.x = this.mPosition.x;
            this.mPrePosition.y = this.mPosition.y;
        }
        this.mPosition = pos;
        if (this.mBodies) {
            const p = this.mBodies.pos;
            p.x = this.mPosition.x;
            p.y = this.mPosition.y;
        }
    }

    drawPolygon(path: IPos[], offset?: IPos) {
        if (!path || path.length < 1) {
            return;
        }
        const vectors = [];
        for (const p of path) {
            vectors.push(new SAT.Vector(p.x, p.y));
        }
        this.mBodies = new SAT.Polygon(new SAT.Vector(this.mPosition.x, this.mPosition.y), vectors);
        if (offset) this.setBodiesOffset(offset);
        this.collsion.add(this.id, this.mBodies);
    }

    setBodiesOffset(offset: IPos) {
        if (!this.mBodies) return;
        this.mBodies.setOffset(new SAT.Vector(offset.x, offset.y));
    }

    removePolygon() {
        if (!this.mBodies) {
            return;
        }
        this.collsion.remove(this.id);
        this.mBodies = null;
    }

    setIgnoreCollsion(val: boolean) {
        this.ignoreCollsion = val;
    }

    destroy() {
        this.removePolygon();
        this.setVelocity(0, 0);
        this.mPosition = null;
        this.mPrePosition = null;
    }

    private getCollideResponses() {
        if (!this.mBodies || this.ignoreCollsion) {
            return [];
        }
        return this.collsion.collideObjects(this.mBodies);
    }

    get position(): IPos {
        return this.mPosition;
    }

    get prePosition(): IPos {
        return this.mPrePosition;
    }

    get bodies() {
        return this.mBodies;
    }
}
