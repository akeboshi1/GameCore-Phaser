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
var SoundWorkerManager = /** @class */ (function (_super) {
    __extends_1(SoundWorkerManager, _super);
    function SoundWorkerManager(game) {
        var _this = _super.call(this) || this;
        _this.game = game;
        return _this;
    }
    SoundWorkerManager.prototype.addPackListener = function () {
        var connection = this.game.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL, this.onPlaySoundHandler);
        }
    };
    SoundWorkerManager.prototype.removePacketListener = function () {
        var connection = this.game.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    };
    SoundWorkerManager.prototype.stopAll = function () {
        this.game.renderPeer.stopAllSound();
    };
    SoundWorkerManager.prototype.pauseAll = function () {
        this.game.renderPeer.pauseAllSound();
    };
    SoundWorkerManager.prototype.resume = function () {
        this.game.renderPeer.resumeSound();
    };
    SoundWorkerManager.prototype.destroy = function () {
        this.removePacketListener();
    };
    SoundWorkerManager.prototype.onPlaySoundHandler = function (packet) {
        var content = packet.content;
        if (content.loop === undefined) {
            content.loop = true;
        }
        this.game.peer.render.playOsdSound(content);
    };
    Object.defineProperty(SoundWorkerManager.prototype, "connection", {
        get: function () {
            return this.game.connection;
        },
        enumerable: true,
        configurable: true
    });
    return SoundWorkerManager;
}(PacketHandler));
export { SoundWorkerManager };
//# sourceMappingURL=sound.worker.manager.js.map