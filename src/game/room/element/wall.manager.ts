import {Helpers, IPos, Position45, Tool} from "utils";
import {IRoomService} from "..";
import {Wall} from "../wall/wall";
import {Sprite} from "baseModel";
import {LayerEnum} from "game-capsule";

export class WallManager {
    private walls: Wall[];
    constructor(private roomService: IRoomService) {
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

    // 在墙面上
    isInWallRect(pos: IPos): boolean {
        for (const wall of this.walls) {
            const minX = wall.model.pos.x - this.roomService.roomSize.tileWidth * 0.5;
            const maxX = wall.model.pos.x + this.roomService.roomSize.tileWidth * 0.5;
            const minY = wall.model.pos.y - this.roomService.roomSize.tileHeight * 5;// todo: add 'wallHeight' to model
            const maxY = wall.model.pos.y;
            if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
                return true;
            }
        }
        return false;
    }

    // 靠墙
    isAgainstWall(pos: IPos): boolean {
        const pos45 = Position45.transformTo45(pos, this.roomService.roomSize);
        for (const wall of this.walls) {
            const wallPos45 = Position45.transformTo45(wall.model.pos, this.roomService.roomSize);
            if (wallPos45.x === pos45.x + 1 ||
            wallPos45.x === pos45.x - 1 ||
            wallPos45.y === pos45.y + 1 ||
            wallPos45.y === pos45.y - 1) {
                return true;
            }
        }

        return false;
    }
}
