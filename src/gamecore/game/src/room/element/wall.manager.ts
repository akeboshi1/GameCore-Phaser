import { Helpers } from "structure";
import { IRoomService } from "../room";
import { Wall } from "../wall/wall";
import { Sprite } from "src/base/model";
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
