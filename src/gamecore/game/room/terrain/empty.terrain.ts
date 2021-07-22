import { IPos } from "structure";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room";
export class EmptyTerrain extends BlockObject {
    public dirty: boolean = false;
    constructor(room: IRoomService, public pos: IPos, i, j) {
        super(i * room.roomSize.rows + j + 10000, room);
        this.setPosition(pos);
    }

    public setPosition(pos: IPos) {
        if (this.moveControll) {
            this.moveControll.setPosition(pos);
        }
        // const scaleRatio = 1;
        // this._tempVec2.x = pos.x * scaleRatio;
        // this._tempVec2.y = pos.y * scaleRatio;
        // this.mRoomService.game.peer.physicalPeer.setPosition(this.guid, pos.x, pos.y);
    }

    getPosition() {
        return this.pos;
    }

    addDisplay(): Promise<any> {
        this.drawBody();
        return Promise.resolve();
    }

    removeDisplay(): Promise<any> {
        // this.mRoomService.game.physicalPeer.removeBody(this.guid);
        this.removeBody();
        return Promise.resolve();
    }

    public destroy() {
        this.removeBody();
    }

    protected drawBody() {
        const roomSize = this.mRoomService.roomSize;
        const height = roomSize.tileHeight;
        const width = roomSize.tileWidth;
        const paths = [{ x: 0, y: 0 }, { x: width / 2, y: height / 2 }, { x: 0, y: height }, { x: -width / 2, y: height / 2 }];
        this.moveControll.drawPolygon(paths);
        // this.mRoomService.game.physicalPeer.addBody(this.guid);
        // this.mRoomService.game.peer.physicalPeer.createBodyFromVertices(this.guid, this._tempVec2.x * dpr, this._tempVec2.y * dpr + height * 0.5,
        //     [paths], true, true, { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
    }
}
