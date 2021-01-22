import { IPos } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";

export class EmptyTerrain extends BlockObject {
    constructor(room: IRoomService, public pos: IPos) {
        super(Number(pos.x + "" + pos.y), room);
        this.setPosition(pos);
        this.addDisplay();
    }

    getPosition() {
        return this.pos;
    }

    addDisplay(): Promise<any> {
        this.mRoomService.game.physicalPeer.addBody(this.id);
        return Promise.resolve();
    }

    removeDisplay(): Promise<any> {
        this.mRoomService.game.physicalPeer.removeBody(this.id);
        return Promise.resolve();
    }

    drawBody() {
        const roomSize = this.mRoomService.roomSize;
        const dpr = this.mRoomService.game.scaleRatio;
        const height = roomSize.tileHeight * dpr;
        const width = roomSize.tileWidth * dpr;
        const paths = [{ x: 0, y: -height / 2 }, { x: width / 2, y: 0 }, { x: 0, y: height / 2 }, { x: -width / 2, y: 0 }];
        this.mRoomService.game.peer.physicalPeer.createBodyFromVertices(this.guid, this._tempVec2.x * dpr, this._tempVec2.y * dpr + height * 0.5,
            [paths], true, { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
    }

    public destroy() {
        this.mRoomService.game.physicalPeer.removeBody(this.id);
    }
}
