import { Direction, LogicPos, Position45 } from "structure";
import { Wall } from "../wall/wall";
import { Sprite } from "baseGame";
import { LayerEnum } from "game-capsule";
import { Helpers } from "utils";
var WallManager = /** @class */ (function () {
    function WallManager(roomService) {
        this.roomService = roomService;
        this.walls = [];
    }
    WallManager.prototype.init = function () {
        var elementStorage = this.roomService.game.elementStorage;
        var wallCollection = elementStorage.getWallCollection();
        if (!wallCollection) {
            return;
        }
        var walls = Array.from(wallCollection.dataMap.values());
        for (var _i = 0, walls_1 = walls; _i < walls_1.length; _i++) {
            var palette = walls_1[_i];
            var obj = {
                id: Helpers.genId(),
                point3f: {
                    x: palette.x,
                    y: palette.y
                },
                layer: LayerEnum.Wall,
                direction: palette.dir,
            };
            var sprite = new Sprite(obj);
            sprite.setDisplayInfo(elementStorage.getMossPalette(palette.key).frameModel);
            var w = new Wall(sprite, this.roomService);
            this.walls.push(w);
        }
    };
    WallManager.prototype.destroy = function () {
        for (var _i = 0, _a = this.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            wall.destroy();
        }
        this.walls.length = 0;
    };
    // todo: move to pica
    // 在墙面上
    WallManager.prototype.isInWallRect = function (pos) {
        var pos45 = Position45.transformTo45(pos, this.roomService.roomSize);
        // 4的由来：
        // 墙高：6倍地块高度，其中有1倍被藏在地块下，所以可放置区域只有5倍地块高的区域，所以xy范围为[-4, 0]
        for (var _i = 0, _a = this.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            var minX = wall.model.pos.x - 4;
            var maxX = wall.model.pos.x;
            var minY = wall.model.pos.y - 4;
            var maxY = wall.model.pos.y;
            if (pos45.x >= minX && pos45.x <= maxX && pos45.y >= minY && pos45.y <= maxY) {
                return true;
            }
        }
        return false;
    };
    // todo: move to pica
    // 靠墙，按照miniSize坐标系
    WallManager.prototype.isAgainstWall = function (pos, originPoint) {
        var pos45 = Position45.transformTo45(pos, this.roomService.miniSize);
        var checkPos45 = new LogicPos(pos45.x - originPoint.x, pos45.y - originPoint.y);
        for (var _i = 0, _a = this.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            var roomSizePos = wall.model.pos;
            var miniSizePoses = [
                new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2),
                new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2 + 1),
                new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2),
                new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2 + 1)
            ];
            if (wall.model.direction === Direction.concave) {
                // 凹角的墙会删除相邻阴面阳面的墙，所以这里需要额外判断两块墙体的位置
                var yinPos = new LogicPos(roomSizePos.x, roomSizePos.y + 1);
                miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2));
                miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2 + 1));
                miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2));
                miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2 + 1));
                var yangPos = new LogicPos(roomSizePos.x + 1, roomSizePos.y);
                miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2));
                miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2 + 1));
                miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2));
                miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2 + 1));
            }
            for (var _b = 0, miniSizePoses_1 = miniSizePoses; _b < miniSizePoses_1.length; _b++) {
                var miniSizePose = miniSizePoses_1[_b];
                if ((miniSizePose.y === checkPos45.y && (miniSizePose.x === checkPos45.x + 1 || miniSizePose.x === checkPos45.x - 1)) ||
                    (miniSizePose.x === checkPos45.x && (miniSizePose.y === checkPos45.y + 1 || miniSizePose.y === checkPos45.y - 1))) {
                    return true;
                }
            }
        }
        return false;
    };
    // todo: move to pica
    // 替换全部资源
    WallManager.prototype.changeAllDisplayData = function (id) {
        // todo: change display data
    };
    return WallManager;
}());
export { WallManager };
//# sourceMappingURL=wall.manager.js.map