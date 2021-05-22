import { Direction, Helpers, IPos, Logger, LogicPos, Position45, Tool } from "utils";
import { IRoomService } from "..";
import { Wall } from "../wall/wall";
import { FramesModel, Sprite } from "baseModel";
import { LayerEnum } from "game-capsule";
import { BaseDataConfigManager } from "picaWorker";
import { AnimationModel, IDisplay } from "structure";
import { SPRITE_SHEET_KEY } from "../../../editor/canvas/element/element.editor.resource.manager";
import { IExtendCountablePackageItem } from "picaStructure";
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
            const obj = {
                id: Helpers.genId(),
                point3f: {
                    x: palette.x,
                    y: palette.y
                },
                layer: LayerEnum.Wall,
                direction: palette.dir,
            };
            const sprite = new Sprite(obj);
            sprite.init(obj);
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
        const pos45 = Position45.transformTo45(pos, this.roomService.roomSize);
        // 4的由来：
        // 墙高：6倍地块高度，其中有1倍被藏在地块下，所以可放置区域只有5倍地块高的区域，所以xy范围为[-4, 0]
        for (const wall of this.walls) {
            const minX = wall.model.pos.x - 4;
            const maxX = wall.model.pos.x;
            const minY = wall.model.pos.y - 4;
            const maxY = wall.model.pos.y;
            if (pos45.x >= minX && pos45.x <= maxX && pos45.y >= minY && pos45.y <= maxY) {
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

    // todo: move to pica
    // 替换全部资源
    public changeAllDisplayData(id: string) {
        const configMgr = <BaseDataConfigManager>this.roomService.game.configManager;
        const configData = configMgr.getElement2Data(id);
        if (!configData) {
            Logger.getInstance().error("no config data, id: ", id);
            return;
        }
        configMgr.checkDynamicElementPI({ sn: configData.sn, itemid: id, serialize: configData.serializeString }).then((wallConfig) => {
            if (!wallConfig) return;
            for (const wall of this.walls) {
                const sprite = wall.model;
                // @ts-ignore
                sprite.updateDisplay(wallConfig.animationDisplay, wallConfig.animations);
                wall.load(<FramesModel>sprite.displayInfo);
            }
            // Logger.getInstance().log("========>>> config data", wall);
        });
        // todo: change display data
    }
}
