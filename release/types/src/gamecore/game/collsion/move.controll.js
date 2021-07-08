import * as SAT from "sat";
import { LogicPos, Logger } from "structure";
var MoveControll = /** @class */ (function () {
    function MoveControll(id, room) {
        this.id = id;
        this.room = room;
        this.ignoreCollsion = false;
        this.maxWidth = 0;
        this.maxHeight = 0;
        this.mPosition = new LogicPos();
        this.mPrePosition = new LogicPos();
        this.velocity = new LogicPos();
        this.collsion = room.collsionManager;
    }
    MoveControll.prototype.setVelocity = function (x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    };
    MoveControll.prototype.update = function (time, delta) {
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.mPrePosition.x = this.mPosition.x;
            this.mPrePosition.y = this.mPosition.y;
            var pos = this.mBodies ? this.mBodies.pos : this.mPosition;
            pos.x = pos.x + this.velocity.x;
            pos.y = pos.y + this.velocity.y;
            var collideResponses = this.getCollideResponses();
            if (collideResponses.length > 2) {
                // 帧数不高，碰到水平或垂直会抖动
                // TODO 计算两者中心点x y。水平或垂直时停止移动
                pos.x = this.mPosition.x;
                pos.y = this.mPosition.y;
                return;
            }
            for (var _i = 0, collideResponses_1 = collideResponses; _i < collideResponses_1.length; _i++) {
                var response = collideResponses_1[_i];
                // 人物被卡住，停下来
                if (response.aInB || response.bInA || response.overlap > this.maxWidth * 0.5 || response.overlap > this.maxHeight * 0.5) {
                    this.setVelocity(0, 0);
                    pos.x = this.mPosition.x;
                    pos.y = this.mPosition.y;
                    return;
                }
                pos.x -= response.overlapV.x;
                pos.y -= response.overlapV.y;
            }
            this.mPosition.x = pos.x;
            this.mPosition.y = pos.y;
        }
    };
    MoveControll.prototype.setPosition = function (pos) {
        if (this.mPosition) {
            this.mPrePosition.x = this.mPosition.x;
            this.mPrePosition.y = this.mPosition.y;
        }
        this.mPosition = pos;
        if (this.mBodies) {
            var p = this.mBodies.pos;
            p.x = this.mPosition.x;
            p.y = this.mPosition.y;
        }
    };
    MoveControll.prototype.drawPolygon = function (path, offset) {
        if (!path || path.length < 1) {
            return;
        }
        var vectors = [];
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var p = path_1[_i];
            var absX = Math.abs(p.x);
            var absY = Math.abs(p.y);
            vectors.push(new SAT.Vector(p.x, p.y));
            if (absX > this.maxWidth)
                this.maxWidth = absX;
            if (absY > this.maxHeight)
                this.maxHeight = absY;
        }
        this.mBodies = new SAT.Polygon(new SAT.Vector(this.mPosition.x, this.mPosition.y), vectors);
        if (offset)
            this.setBodiesOffset(offset);
        this.collsion.add(this.id, this.mBodies);
    };
    MoveControll.prototype.setBodiesOffset = function (offset) {
        if (!this.mBodies)
            return;
        this.mBodies.setOffset(new SAT.Vector(offset.x, offset.y));
    };
    MoveControll.prototype.removePolygon = function () {
        if (!this.mBodies) {
            return;
        }
        this.collsion.remove(this.id);
        this.mBodies = null;
    };
    MoveControll.prototype.setIgnoreCollsion = function (val) {
        this.ignoreCollsion = val;
    };
    MoveControll.prototype.destroy = function () {
        this.removePolygon();
        this.setVelocity(0, 0);
        this.mPosition = null;
        this.mPrePosition = null;
    };
    MoveControll.prototype.getCollideResponses = function () {
        if (!this.mBodies || this.ignoreCollsion) {
            return [];
        }
        return this.collsion.collideObjects(this.mBodies);
    };
    MoveControll.prototype.getBottomPoint = function (points) {
        // 目前仅支持规则图形，填充按顺时针绘制。第三个为最下面的点
        if (!points || !points[2]) {
            return Logger.getInstance().error("Irregular collisions are not currently supported");
        }
        var bottomPoint = points[2];
        return this.room.transformToMini45(new LogicPos(bottomPoint.x, bottomPoint.y));
    };
    Object.defineProperty(MoveControll.prototype, "position", {
        get: function () {
            return this.mPosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MoveControll.prototype, "prePosition", {
        get: function () {
            return this.mPrePosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MoveControll.prototype, "bodies", {
        get: function () {
            return this.mBodies;
        },
        enumerable: true,
        configurable: true
    });
    return MoveControll;
}());
export { MoveControll };
//# sourceMappingURL=move.controll.js.map