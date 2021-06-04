import { MoveControll } from "src/game/collsion";
import { IPos } from "utils";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room/room";

export class EmptyTerrain extends BlockObject {
    public dirty: boolean = false;
    protected mId: number;
    constructor(private room: IRoomService, public pos: IPos, private i, private j) {
        super(room);
        this.mId= this.i * this.room.roomSize.rows + this.j + 10000;
        this.setPosition(pos);
    }

    public setPosition(pos: IPos) {
        if (this.moveControll) {
            this.moveControll.setPosition(pos);
        }
    }

    getPosition() {
        return this.pos;
    }

    addDisplay(): Promise<any> {
        this.drawBody();
        return Promise.resolve();
    }

    removeDisplay(): Promise<any> {
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
    }

    get id(): number {
        return this.mId;
    }
}
