import {Helpers, IPos, Logger, LogicPos, Position45, Tool} from "utils";
import {IRoomService} from "..";
import {Wall} from "../wall/wall";
import {Sprite} from "baseModel";
import {LayerEnum} from "game-capsule";
import {BaseDataConfigManager} from "picaWorker";
import {AnimationModel, IDisplay} from "structure";
import {SPRITE_SHEET_KEY} from "../../../editor/canvas/element/element.editor.resource.manager";
import {IExtendCountablePackageItem} from "picaStructure";
import * as sha1 from "simple-sha1";

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

    // 靠墙
    public isAgainstWall(pos: IPos, originPoint: IPos): boolean {
        const origin90 = Position45.transformTo90(originPoint, this.roomService.miniSize);
        const pos45 = Position45.transformTo45(new LogicPos(pos.x - origin90.x, pos.y - origin90.y), this.roomService.roomSize);
        for (const wall of this.walls) {
            const wallPos45 = wall.model.pos;
            if (wallPos45.x === pos45.x + 1 ||
            wallPos45.x === pos45.x - 1 ||
            wallPos45.y === pos45.y + 1 ||
            wallPos45.y === pos45.y - 1) {
                return true;
            }
        }

        return false;
    }

    // 替换全部资源
    public async changeAll(id: string) {
        const configMgr = <BaseDataConfigManager> this.roomService.game.configManager;
        const itemBase = await <IExtendCountablePackageItem> configMgr.getItemBaseByID(id);
        if (!itemBase) {
            Logger.getInstance().error("no config data, id: ", id);
            return;
        }
        const anis = new Map();
        for (const animation of itemBase.animations) {
            anis.set(animation.aniName, animation);
        }
        for (const wall of this.walls) {
            wall.load({
                discriminator: "FramesModel",
                id: wall.id,
                gene: sha1.sync(itemBase.display.dataPath + itemBase.display.texturePath),
                animations: anis,
                animationName: "idle",
                display: {
                    texturePath: itemBase.display.texturePath,
                    dataPath: itemBase.display.dataPath
                }
            });
        }
    }
}
