import * as SAT from "sat";
import { IPos, LogicPos } from "structure";
import { IRoomService } from "../room";
import { CollsionManager } from "./collsion.manager";
export class MoveControll {

    protected mBodies: SAT.Polygon;
    private ignoreCollsion: boolean = false;
    private velocity: IPos;
    private mPosition: IPos;
    private mPrePosition: IPos;
    private collsion: CollsionManager;
    private maxWidth: number = 0;
    private maxHeight: number = 0;

    constructor(private id: number, private room: IRoomService) {
        this.mPosition = new LogicPos();
        this.mPrePosition = new LogicPos();
        this.velocity = new LogicPos();
        this.collsion = room.collsionManager;
    }

    setVelocity(x: number, y: number) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    update(time: number, delta: number) {
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            this.mPrePosition.x = this.mPosition.x;
            this.mPrePosition.y = this.mPosition.y;

            const pos = this.mBodies ? this.mBodies.pos : this.mPosition;
            pos.x = pos.x + this.velocity.x;
            pos.y = pos.y + this.velocity.y;

            const collideResponses = this.getCollideResponses();
            if (collideResponses.length > 2) {
                // 帧数不高，碰到水平或垂直会抖动
                // TODO 计算两者中心点x y。水平或垂直时停止移动
                pos.x = this.mPosition.x;
                pos.y = this.mPosition.y;
                return;
            }
            for (const response of collideResponses) {
                // 人物被卡住，停下来
                if (response.aInB || response.bInA || response.overlap > this.maxWidth * 0.5 || response.overlap > this.maxHeight * 0.5) {
                    this.setVelocity(0, 0);
                    pos.x = this.mPosition.x;
                    pos.y = this.mPosition.y;
                    return;
                }
                pos.x -= response.overlapV.x;
                pos.y -= response.overlapV.y;
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
            const absX = Math.abs(p.x);
            const absY = Math.abs(p.y);
            vectors.push(new SAT.Vector(p.x, p.y));
            if (absX > this.maxWidth) this.maxWidth = absX;
            if (absY > this.maxHeight) this.maxHeight = absY;
        }
        this.mBodies = new SAT.Polygon(new SAT.Vector(this.mPosition.x, this.mPosition.y), vectors);
        if (offset) this.setBodiesOffset(offset);
        this.collsion.add(this.id, this.mBodies);
    }

    setBodiesOffset(offset: IPos) {
        if (!this.mBodies) return;
        this.mBodies.setOffset(new SAT.Vector(offset.x, offset.y));
    }

    public removePolygon() {
        if (!this.mBodies) {
            return;
        }
        this.collsion.remove(this.id);
        this.mBodies = null;
    }

    public setIgnoreCollsion(val: boolean) {
        this.ignoreCollsion = val;
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
