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
    private movepath: Array<{ x: number, y: number }> = [];
    private moveData: op_client.MoveData = new op_client.MoveData();
    private followgroup: FollowGroup;
    constructor(group: IGroup) {
        super();
        this.followgroup = (group as FollowGroup);
    }
    public execute() {
        const room = (this.target.roomService as Room);
        room.frameManager.add(this, this.update);
        this.moveData.moveObjectId = this.owner.id;
        this.moveData.destinationPoint3f = new op_def.PBPoint3f();
    }

    public update() {
        if (this.target.getState() === PlayerState.WALK) {
            const pos = this.target.getPosition();
            this.movepath.push({ x: pos.x, y: pos.y });
        }
        if (this.movepath.length > 20) {
            const point = this.movepath[10];
            this.moveData.destinationPoint3f.x = point.x;
            this.moveData.destinationPoint3f.y = point.y;
            this.owner.move(this.moveData);
            this.movepath.length = 0;
        }
    }

    public destroy() {
        super.destroy();
        const room = (this.target.roomService as Room);
        room.frameManager.remove(this, this.update);
        this.moveData = null;
        this.movepath.length = 0;
        this.movepath = null;
    }
}
