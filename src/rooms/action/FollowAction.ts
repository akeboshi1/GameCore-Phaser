import { AIAction } from "./AIAction";
import { Element, PlayerState } from "../element/element";
import { op_client, op_def } from "pixelpai_proto";
import { IGroup } from "../group/IGroup";
import { FollowGroup } from "../group/FollowGroup";
import { Room } from "../room";

export class FollowAction extends AIAction {

    public get target(): Element {
        return this.followgroup.owner;
    }
    private followgroup: FollowGroup;
    private movePath: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH;
    private timeCounter: number = 0;
    private intervalCounter: number = 0;
    private duration: number = 0;
    private tempPath: Array<{ x: number, y: number, duration: number }>;
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
        if (this.target.getState() === PlayerState.WALK) {
            this.duration += delta;
            if (this.intervalCounter > 3) {
                this.intervalCounter = 0;
                const pos = this.target.getPosition();
                const tempos = {
                    x: pos.x,
                    y: pos.y,
                    duration: this.duration
                };
                this.tempPath.push(tempos);
                this.duration = 0;
            }
            this.intervalCounter++;
            this.timeCounter++;
        }
        if (this.timeCounter > 20) {
            let duration = 0;
            const now = this.owner.roomService.now();
            const path = this.tempPath.splice(0, this.tempPath.length - 3);
            for (const tempPos of path) {
                duration += tempPos.duration;
                const point = new op_client.MovePoint();
                point.point3f = new op_def.PBPoint3f();
                point.point3f.x = tempPos.x;
                point.point3f.y = tempPos.y;
                point.timestemp = now + duration;
                this.movePath.path.push(point);
            }
            this.movePath.timestemp = now + duration;
            this.owner.movePath(this.movePath);
            this.timeCounter = 0;
            this.movePath.path.length = 0;
            this.movePath.timestemp = 0;
            path.length = 0;
        }
    }

    public destroy() {
        super.destroy();
        const room = (this.target.roomService as Room);
        room.frameManager.remove(this, this.update);
        this.movePath.path.length = 0;
        this.followgroup = null;
    }
}
