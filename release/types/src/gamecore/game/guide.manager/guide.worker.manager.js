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
import { PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
var GuideWorkerManager = /** @class */ (function (_super) {
    __extends_1(GuideWorkerManager, _super);
    function GuideWorkerManager(game) {
        var _this = _super.call(this) || this;
        _this.game = game;
        return _this;
    }
    GuideWorkerManager.prototype.addPackListener = function () {
        var connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_GUIDE_DATA, this.onUPDATE_PLAYER_GUIDE);
    };
    GuideWorkerManager.prototype.removePackListener = function () {
        var connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
    };
    GuideWorkerManager.prototype.stopGuide = function (id) {
        // const configMgr = <any>this.game.configManager;
        // if (!configMgr) return;
        // configMgr.updateGuideState(id, true);
        // const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_FINISH_GUIDE);
        // const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_FINISH_GUIDE = packet.content;
        // content.index = Number(id);
        // this.game.connection.send(packet);
    };
    GuideWorkerManager.prototype.onUPDATE_PLAYER_GUIDE = function (packet) {
        // const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_GUIDE_DATA = packet.content;
        // const ids = content.finishedGuide;
        // if (!ids || ids.length < 1) return;
        // const configMgr = <any>this.game.configManager;
        // ids.forEach((id) => {
        //     configMgr.updateGuideState(String(id), true);
        // });
    };
    GuideWorkerManager.prototype.destroy = function () {
        this.removePackListener();
    };
    return GuideWorkerManager;
}(PacketHandler));
export { GuideWorkerManager };
//# sourceMappingURL=guide.worker.manager.js.map