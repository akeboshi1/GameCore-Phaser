import { AIAction } from "./AIAction";
import { Element, PlayerState } from "../element/element";
import { Pos } from "../../utils/pos";
import { op_client, op_def } from "pixelpai_proto";

export class FollowAction extends AIAction {

    public target: Element;
    private curTargetPos: Pos;
    private movepath: Array<{ x: number, y: number }> = [];
    private moveData: op_client.MoveData = new op_client.MoveData();
    public execute() {
        this.target.eleMgr.frameMgr.add(this, this.update);
        this.moveData.moveObjectId = this.owner.id;
        this.moveData.destinationPoint3f = new op_def.PBPoint3f();
    }

    public update() {
        if (this.target.getState() === PlayerState.WALK) {
            const pos = this.target.getPosition();
            this.curTargetPos = pos;
            this.movepath.push({ x: pos.x, y: pos.y });
        }
        if (this.movepath.length > 0) {
            const point = this.movepath.splice(0, 1)[0];
            this.moveData.destinationPoint3f.x = point.x;
            this.moveData.destinationPoint3f.y = point.y;
            this.owner.move(this.moveData);
        }
    }

    public destroy() {
        super.destroy();
        this.target.eleMgr.frameMgr.remove(this, this.update);
        this.moveData = null;
        this.movepath.length = 0;
        this.movepath = null;
    }
}
