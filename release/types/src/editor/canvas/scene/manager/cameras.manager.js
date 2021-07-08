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
import { BaseCamerasManager } from "baseRender";
import { PBpacket } from "net-socket-packet";
import { op_editor } from "pixelpai_proto";
var EditorCamerasManager = /** @class */ (function (_super) {
    __extends_1(EditorCamerasManager, _super);
    function EditorCamerasManager(sceneEditor) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.connection = _this.sceneEditor.connection;
        return _this;
    }
    EditorCamerasManager.prototype.centerCamera = function () {
        if (!this.mMain) {
            return;
        }
        var roomSize = this.sceneEditor.roomSize;
        this.mMain.setScroll((-this.mMain.width) >> 1, (roomSize.sceneHeight - this.mMain.height) >> 1);
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        var content = pkt.content;
        content.x = this.mMain.scrollX;
        content.y = this.mMain.scrollY;
        content.width = this.mMain.width;
        content.height = this.mMain.height;
        this.connection.send(pkt);
    };
    EditorCamerasManager.prototype.syncCameraScroll = function () {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        var content = pkt.content;
        content.x = this.mMain.scrollX / this.zoom;
        content.y = this.mMain.scrollY / this.zoom;
        content.width = 0;
        content.height = 0;
        this.connection.send(pkt);
    };
    return EditorCamerasManager;
}(BaseCamerasManager));
export { EditorCamerasManager };
//# sourceMappingURL=cameras.manager.js.map