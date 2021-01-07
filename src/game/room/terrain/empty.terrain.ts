import { Bodies } from "matter-js";
import { IPos } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";

export class EmptyTerrain extends BlockObject {
    constructor(room: IRoomService, public pos: IPos) {
        super(room);
        this.setPosition(pos);
        // this.addToBlock();
        this.addDisplay();
    }

    getPosition() {
        return this.pos;
    }

    addDisplay(): Promise<any> {
        super.addDisplay();
        this.addBody();
        return Promise.resolve();
    }

    removeDisplay(): Promise<any> {
        super.removeDisplay();
        this.removeBody();
        return Promise.resolve();
    }

    drawBody() {
        const roomSize = this.mRoomService.roomSize;
        const dpr = this.mRoomService.game.scaleRatio;
        const height = roomSize.tileHeight * dpr;
        const width = roomSize.tileWidth * dpr;
        const paths = [{ x: 0, y: -height / 2 }, { x: width / 2, y: 0 }, { x: 0, y: height / 2 }, { x: -width / 2, y: 0 }];
        // const body = this.setVertices(paths);
        const body = Bodies.fromVertices(this._tempVec.x, this._tempVec.y + height * 0.5, [paths], { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
        body.inertia = Infinity;
        body.inverseInertia = Infinity;
        body.friction = 0;
        this.setExistingBody(body, true);
    }

    public destroy() {
        this.removeBody();
        this.body = undefined;
    }
}
