import { IPos } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";

export class EmptyTerrain extends BlockObject {
    public dirty: boolean = false;
    constructor(room: IRoomService, public pos: IPos, i, j) {
        super(Number(i * 10 + "" + j * 10), room);
        this.setPosition(pos);
        this.addDisplay();
    }

    public setPosition(pos: IPos) {
        const scaleRatio = 1;
        this._tempVec2.x = pos.x * scaleRatio;
        this._tempVec2.y = pos.y * scaleRatio;
        this.mRoomService.game.peer.physicalPeer.setPosition(this.guid, pos.x, pos.y);
    }

    getPosition() {
        return this.pos;
    }

    addDisplay(): Promise<any> {
        this.mRoomService.game.physicalPeer.addBody(this.guid);
        this.drawBody();
        return Promise.resolve();
    }

    removeDisplay(): Promise<any> {
        this.mRoomService.game.physicalPeer.removeBody(this.guid);
        return Promise.resolve();
    }

    drawBody() {
        const roomSize = this.mRoomService.roomSize;
        const dpr = this.mRoomService.game.scaleRatio;
        const height = roomSize.tileHeight * dpr;
        const width = roomSize.tileWidth * dpr;
        const paths = [{ x: 0, y: -height / 2 }, { x: width / 2, y: 0 }, { x: 0, y: height / 2 }, { x: -width / 2, y: 0 }];
        this.mRoomService.game.peer.physicalPeer.createBodyFromVertices(this.guid, this._tempVec2.x * dpr, this._tempVec2.y * dpr + height * 0.5,
            [paths], true, true, { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
    }

    public destroy() {
        this.mRoomService.game.physicalPeer.removeBody(this.guid);
    }
}
