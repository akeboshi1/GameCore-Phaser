import { Helpers, Logger } from "utils";
import { IRoomService } from "..";
import { op_def } from "pixelpai_proto";
import { Wall } from "../wall/wall";
import { Sprite } from "baseModel";
import { LayerEnum } from "game-capsule";

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
}
