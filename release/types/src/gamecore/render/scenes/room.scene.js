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
import { BasicScene } from "baseRender";
var RoomScene = /** @class */ (function (_super) {
    __extends_1(RoomScene, _super);
    function RoomScene(config) {
        return _super.call(this, config) || this;
    }
    RoomScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        if (data) {
            this.mRoomID = data.roomid;
        }
    };
    RoomScene.prototype.create = function () {
        this.initListener();
        _super.prototype.create.call(this);
    };
    RoomScene.prototype.initListener = function () {
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
        this.input.on("gameout", this.onGameOutHandler, this);
    };
    RoomScene.prototype.onGameOutHandler = function () {
        this.input.off("pointerdown", this.onPointerDownHandler, this);
        this.input.off("pointerup", this.onPointerUpHandler, this);
        this.input.off("gameout", this.onGameOutHandler, this);
    };
    RoomScene.prototype.onPointerDownHandler = function (pointer, currentlyOver) {
    };
    RoomScene.prototype.onPointerUpHandler = function (pointer, currentlyOver) {
    };
    return RoomScene;
}(BasicScene));
export { RoomScene };
//# sourceMappingURL=room.scene.js.map