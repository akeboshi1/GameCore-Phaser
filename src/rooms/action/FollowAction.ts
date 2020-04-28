import { AIAction } from "./AIAction";
import { Element, PlayerState } from "../element/element";
import { op_client, op_def } from "pixelpai_proto";
import { IGroup } from "../group/IGroup";
import { FollowGroup } from "../group/FollowGroup";
import { Room } from "../room";
import { Pos } from "../../utils/pos";
import { Logger } from "../../utils/log";

export class FollowAction extends AIAction {

    public get target(): Element {
        return this.followgroup.owner;
    }
    private followgroup: FollowGroup;
    private movePath: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH;
    private tempPath: Array<{ x: number, y: number, len: number, angle: number }>;
    private tempPos = new Pos();
    private distance: number = 50;
    private offset: number = 20;
    private tempdis: number = 0;
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
        this.setStartPosition();
    }

    public update(time: number, delta: number) {
        let canMove: boolean = false;
        if (this.target.getState() === PlayerState.WALK) {
            const pos = this.target.getPosition();
            const tempos = {
                x: pos.x,
                y: pos.y,
                len: 0,
                angle: 0
            };
            if (this.tempPath.length > 0) {
                const lastpos = this.tempPath[this.tempPath.length - 1];
                lastpos.angle = this.getAngle(lastpos, tempos);
                const len = this.getLength(tempos, lastpos);
                lastpos.len = len;
                this.tempdis += len;
                if (this.tempdis > this.distance) {
                    canMove = true;
                    if (this.tempdis > this.distance + 5) {
                        this.tempdis -= this.tempPath.splice(0, 1)[0].len;
                    }
                    this.tempdis -= this.tempPath[0].len;
                }
            }
            this.tempPath.push(tempos);
        } else {
            if (this.tempdis > this.distance) {
                canMove = true;
                this.tempdis -= this.tempPath[0].len;
            }
        }
        if (canMove) {
            const point = this.tempPath.splice(0, 1)[0];
            if (point) {
                this.tempPos.x = point.x;
                this.tempPos.y = point.y + this.offset;
                this.owner.movePosition(this.tempPos, point.angle);
            }
        }
    }

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
    private getLength(point1: any, point2: any) {
        const x = (point1.x - point2.x);
        const y = (point1.y - point2.y);
        const len = Math.sqrt(x * x + y * y);
        return len;
    }
    private setStartPosition() {
        const pos = this.owner.getPosition();
        pos.y += this.offset;
        pos.x -= this.distance;
        this.owner.setPosition(pos);
        let dis = this.distance;
        const interdis = 2;
        const hy = pos.y - this.offset;
        while (dis > 0) {
            dis -= interdis;
            const tempos = {
                x: pos.x +(this.distance-dis),
                y: hy,
                len: 0,
                angle: 0
            };
            if (this.tempPath.length > 0) {
                const lastpos = this.tempPath[this.tempPath.length - 1];
                lastpos.angle = this.getAngle(lastpos, tempos);
                const len = this.getLength(tempos, lastpos);
                lastpos.len = len;
                this.tempdis += len;
            }
            this.tempPath.push(tempos);
        }
    }
}
