import { Direction, IPos, Logger, LogicPos, Position45 } from "structure";
import { IRoomService } from "..";
import { Wall } from "../wall/wall";
import { Sprite } from "baseGame";
import { LayerEnum } from "game-capsule";
import * as sha1 from "simple-sha1";
import { Helpers } from "utils";

export class WallManager {
    protected walls: Wall[];
    constructor(protected roomService: IRoomService) {
        this.walls = [];
    }

    init() {
        const elementStorage = this.roomService.game.elementStorage;
        const wallCollection = elementStorage.getWallCollection();
        if (!wallCollection) {
            return;
        }
        const walls = Array.from(wallCollection.dataMap.values());
        for (const palette of walls) {
            const sprite = new Sprite({
                id: Helpers.genId(),
                point3f: {
                    x: palette.x,
                    y: palette.y
                },
                layer: LayerEnum.Wall,
                direction: palette.dir,
            });
            sprite.setDisplayInfo(elementStorage.getMossPalette(palette.key).frameModel);
            const w = new Wall(sprite, this.roomService);
            this.walls.push(w);
        }
    }

    destroy() {
        for (const wall of this.walls) {
            wall.destroy();
        }
        this.walls.length = 0;
    }

    // todo: move to pica
    // 在墙面上
    public isInWallRect(pos: IPos): boolean {
        for (const wall of this.walls) {
            const wallPos90 = Position45.transformTo90(wall.model.pos, this.roomService.roomSize);
            const minX = wallPos90.x - this.roomService.roomSize.tileWidth * 0.5;
            const maxX = wallPos90.x + this.roomService.roomSize.tileWidth * 0.5;
            const minY = wallPos90.y - this.roomService.roomSize.tileHeight * 5;// todo: add 'wallHeight' to model
            const maxY = wallPos90.y;
            if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
                return true;
            }
        }
        return false;
    }

    // todo: move to pica
    // 靠墙，按照miniSize坐标系
    public isAgainstWall(pos: IPos, originPoint: IPos): boolean {
        const pos45 = Position45.transformTo45(pos, this.roomService.miniSize);
        const checkPos45 = new LogicPos(pos45.x - originPoint.x, pos45.y - originPoint.y);
        for (const wall of this.walls) {
            const roomSizePos = wall.model.pos;
            const miniSizePoses = [
                new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2),
                new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2 + 1),
                new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2),
                new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2 + 1)];
            if (wall.model.direction === Direction.concave) {
                // 凹角的墙会删除相邻阴面阳面的墙，所以这里需要额外判断两块墙体的位置
                const yinPos = new LogicPos(roomSizePos.x, roomSizePos.y + 1);
                miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2));
                miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2 + 1));
                miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2));
                miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2 + 1));
                const yangPos = new LogicPos(roomSizePos.x + 1, roomSizePos.y);
                miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2));
                miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2 + 1));
                miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2));
                miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2 + 1));
            }
            for (const miniSizePose of miniSizePoses) {
                if ((miniSizePose.y === checkPos45.y && (miniSizePose.x === checkPos45.x + 1 || miniSizePose.x === checkPos45.x - 1)) ||
                    (miniSizePose.x === checkPos45.x && (miniSizePose.y === checkPos45.y + 1 || miniSizePose.y === checkPos45.y - 1))) {
                    return true;
                }
            }
        }

        return false;
    }

    public changeAllDisplayData(id: string) {
    }
}
