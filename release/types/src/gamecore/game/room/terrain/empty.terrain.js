var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BlockObject } from "../block/block.object";
var EmptyTerrain = /** @class */ (function (_super) {
    __extends_1(EmptyTerrain, _super);
    function EmptyTerrain(room, pos, i, j) {
        var _this = _super.call(this, i * room.roomSize.rows + j + 10000, room) || this;
        _this.pos = pos;
        _this.dirty = false;
        _this.setPosition(pos);
        return _this;
    }
    EmptyTerrain.prototype.setPosition = function (pos) {
        if (this.moveControll) {
            this.moveControll.setPosition(pos);
        }
        // const scaleRatio = 1;
        // this._tempVec2.x = pos.x * scaleRatio;
        // this._tempVec2.y = pos.y * scaleRatio;
        // this.mRoomService.game.peer.physicalPeer.setPosition(this.guid, pos.x, pos.y);
    };
    EmptyTerrain.prototype.getPosition = function () {
        return this.pos;
    };
    EmptyTerrain.prototype.addDisplay = function () {
        this.drawBody();
        return Promise.resolve();
    };
    EmptyTerrain.prototype.removeDisplay = function () {
        // this.mRoomService.game.physicalPeer.removeBody(this.guid);
        this.removeBody();
        return Promise.resolve();
    };
    EmptyTerrain.prototype.destroy = function () {
        this.removeBody();
    };
    EmptyTerrain.prototype.drawBody = function () {
        var roomSize = this.mRoomService.roomSize;
        var height = roomSize.tileHeight;
        var width = roomSize.tileWidth;
        var paths = [{ x: 0, y: 0 }, { x: width / 2, y: height / 2 }, { x: 0, y: height }, { x: -width / 2, y: height / 2 }];
        this.moveControll.drawPolygon(paths);
        // this.mRoomService.game.physicalPeer.addBody(this.guid);
        // this.mRoomService.game.peer.physicalPeer.createBodyFromVertices(this.guid, this._tempVec2.x * dpr, this._tempVec2.y * dpr + height * 0.5,
        //     [paths], true, true, { isStatic: true, inertia: Infinity, inverseInertia: Infinity });
    };
    return EmptyTerrain;
}(BlockObject));
export { EmptyTerrain };
//# sourceMappingURL=empty.terrain.js.map