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
import { BaseHandler, BaseStateManager } from "./base.state.manager";
var RoomStateManager = /** @class */ (function (_super) {
    __extends_1(RoomStateManager, _super);
    function RoomStateManager(room) {
        return _super.call(this, room) || this;
    }
    RoomStateManager.prototype.init = function () {
        this.add = new AddHandler(this.room);
        this.delete = new DeleteHandler(this.room);
    };
    return RoomStateManager;
}(BaseStateManager));
export { RoomStateManager };
var AddHandler = /** @class */ (function (_super) {
    __extends_1(AddHandler, _super);
    function AddHandler(room) {
        return _super.call(this, room) || this;
    }
    AddHandler.prototype.skyBoxAnimation = function (state) {
        var buf = Buffer.from(state.packet);
        var len = buf.readUInt32BE(0);
        var content = buf.slice(4);
        if (len === content.length) {
            this.room.game.renderPeer.updateSkyboxState(JSON.parse(content.toString()));
        }
    };
    AddHandler.prototype.setCameraBounds = function (state) {
        var buf = Buffer.from(state.packet);
        if (!buf) {
            return;
        }
        var x = null;
        var y = null;
        var width = buf.readDoubleBE(0);
        var height = buf.readDoubleBE(8);
        if (buf.length >= 24) {
            x = width;
            y = height;
            width = buf.readDoubleBE(16);
            height = buf.readDoubleBE(24);
        }
        if (!width || !height) {
            // Logger.getInstance().debug("setCameraBounds error", bounds);
            return;
        }
        var roomSize = this.room.roomSize;
        var scaleRatio = this.room.game.scaleRatio;
        x = -width * 0.5 + (x ? x : 0);
        y = (roomSize.sceneHeight - height) * 0.5 + (y ? y : 0);
        x *= scaleRatio;
        y *= scaleRatio;
        width *= scaleRatio;
        height *= scaleRatio;
        this.room.game.renderPeer.setCamerasBounds(x, y, width, height);
    };
    return AddHandler;
}(BaseHandler));
var DeleteHandler = /** @class */ (function (_super) {
    __extends_1(DeleteHandler, _super);
    function DeleteHandler(room) {
        return _super.call(this, room) || this;
    }
    return DeleteHandler;
}(BaseHandler));
//# sourceMappingURL=room.state.manager.js.map