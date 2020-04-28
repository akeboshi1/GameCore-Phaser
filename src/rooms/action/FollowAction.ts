import { AIAction } from "./AIAction";
import { Element, PlayerState } from "../element/element";
import { op_client, op_def } from "pixelpai_proto";
import { IGroup } from "../group/IGroup";
import { FollowGroup } from "../group/FollowGroup";
import { Room } from "../room";
import { Pos } from "../../utils/pos";

export class FollowAction extends AIAction {

    public get target(): Element {
        return this.followgroup.owner;
    }
    private followgroup: FollowGroup;
    private movePath: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH;

    // private timeCounter: number = 0;
    // private intervalCounter: number = 0;
    // private duration: number = 0;
    // private tempPath: Array<{ x: number, y: number, duration: number }>;
    // private offset: number = 20;
    // private isMoving: boolean = false;

    private timeCounter: number = 20;
    private intervalCounter: number = 0;
    private tempPath: Array<{ x: number, y: number, angle: number }>;
    private tempPos = new Pos();

    private distance: number = 20;
    constructor(group: IGroup) {
        super();
        this.followgroup = (group as FollowGroup);
        this.movePath = new op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH();
        this.movePath.path = [];
        this.tempPath = [];
    }
    public execute() {
        const room = (this.target.roomService as Room);
        room.frameManager.add(this, this.update);
        this.movePath.id = this.owner.id;
    }

    public update(time: number, delta: number) {
        let canMove: boolean = false;
        if (this.target.getState() === PlayerState.WALK) {
            const pos = this.target.getPosition();
            const tempos = {
                x: pos.x,
                y: pos.y,
                angle: 0
            };
            if (this.tempPath.length > 0) {
                const lastpos = this.tempPath[this.tempPath.length - 1];
                lastpos.angle = this.getAngle(lastpos, tempos);
            }
            this.tempPath.push(tempos);

            this.intervalCounter++;
            if (this.intervalCounter > this.timeCounter) canMove = true;
        } else {
            if (this.intervalCounter > 0) {
                if (this.intervalCounter === this.timeCounter) {
                    this.setLastPoint(this.tempPath, this.distance);
                }
                this.intervalCounter--;
                canMove = true;
            }
        }
        if (this.tempPath.length > 1 && canMove) {
            const point = this.tempPath.splice(0, 1)[0];
            if (point) {
                this.tempPos.x = point.x;
                this.tempPos.y = point.y;
                this.owner.movePosition(this.tempPos, point.angle);
            }
        }
    }

    // public update(time: number, delta: number) {
    //     let canMove: boolean = false;
    //     let pointLen: number = this.tempPath.length;
    //     if (this.target.getState() === PlayerState.WALK) {
    //         this.duration += delta;
    //         if (this.intervalCounter > 2) {
    //             this.intervalCounter = 0;
    //             const pos = this.target.getPosition();
    //             const tempos = {
    //                 x: pos.x,
    //                 y: pos.y,
    //                 duration: this.duration
    //             };
    //             this.tempPath.push(tempos);
    //             this.duration = 0;
    //         }
    //         this.intervalCounter++;
    //         this.timeCounter++;
    //         if (this.timeCounter > 10) {
    //             canMove = true;
    //             this.timeCounter = 0;
    //         }

    //         this.isMoving = true;
    //     } else {
    //         if (this.timeCounter > 0) {
    //             this.timeCounter = 0;
    //             if (this.isMoving) {
    //                 this.isMoving = false;
    //                 pointLen = this.setLastPoint(this.tempPath, this.distance);
    //             }
    //             canMove = true;
    //         }
    //     }
    //     if (canMove) {
    //         let duration = 0;
    //         const now = this.owner.roomService.now();
    //         const path = this.tempPath.splice(0, pointLen);
    //         for (const tempPos of path) {
    //             duration += tempPos.duration;
    //             const point = new op_client.MovePoint();
    //             point.point3f = new op_def.PBPoint3f();
    //             point.point3f.x = tempPos.x;
    //             point.point3f.y = tempPos.y + this.offset;
    //             point.timestemp = now + duration;
    //             this.movePath.path.push(point);
    //         }
    //         this.movePath.timestemp = now + duration;
    //         this.owner.movePath(this.movePath);
    //         this.timeCounter = 0;
    //         this.movePath.path.length = 0;
    //         this.movePath.timestemp = 0;
    //     }
    // }

    public destroy() {
        super.destroy();
        const room = (this.target.roomService as Room);
        room.frameManager.remove(this, this.update);
        this.movePath.path.length = 0;
        this.followgroup = null;
    }

    private getAngle(point1: any, point2: any) {
        if (!(point1.y === point2.y && point1.x === point2.x)) {
            const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI);
            return angle;
        }
        return null;
    }

    private setLastPoint(tempArr: any, distance: number) {
        let curLen: number = 0;
        let curNum = tempArr.length;
        for (let index = tempArr.length - 1; index > 0; index--) {
            const point = tempArr[index];
            const next = tempArr[index - 1];
            const tempLen = this.getLength(point, next);
            curNum--;
            if (curLen + tempLen > distance) {
                break;

            } else {
                curLen += tempLen;
            }
        }
        return curNum;
    }

    private getLength(point1: any, point2: any) {
        const x = (point1.x - point2.x);
        const y = (point1.y - point2.y);
        const len = Math.sqrt(x * x + y * y);
        return len;
    }

    private getLerpPoint(point1: any, point2: any, t: number) {
        const point = { x: 0, y: 0, angle: 0 };
        point.x = point1.x + (point1.x - point2.x) * t;
        point.y = point1.y + (point1.y - point2.y) * t;
        return point;
    }
}
