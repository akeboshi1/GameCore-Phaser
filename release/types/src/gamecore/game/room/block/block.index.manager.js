var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { op_virtual_world, op_def } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Tool, BlockIndex } from "utils";
var BlockIndexManager = /** @class */ (function () {
    function BlockIndexManager(room) {
        this.room = room;
        this.preBlockIndex = [];
        this.zoom = room.game.scaleRatio;
    }
    BlockIndexManager.prototype.checkBlockIndex = function (cameraView) {
        return __awaiter(this, void 0, void 0, function () {
            var blockIndex;
            return __generator(this, function (_a) {
                blockIndex = new BlockIndex().getBlockForCameras(cameraView, this.room.roomSize);
                if (!Tool.equalArr(this.preBlockIndex, blockIndex)) {
                    this.syncBlockIndex(blockIndex);
                }
                return [2 /*return*/];
            });
        });
    };
    BlockIndexManager.prototype.syncBlockIndex = function (blockIndex) {
        var _this = this;
        var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK);
        var content = pkt.content;
        content.blockIndex = blockIndex;
        this.room.game.connection.send(pkt);
        // TODO 根据blockIndex新增获取pi物件
        var newIndex = blockIndex.filter(function (index) { return _this.preBlockIndex.includes(index) === false; });
        var elementStorage = this.room.game.elementStorage;
        // const remove = this.preBlockIndex.filter((index) => blockIndex.includes(index) === false);
        var element = elementStorage.getElementFromBlockIndex(newIndex, op_def.NodeType.ElementNodeType);
        this.room.elementManager.addDisplayRef(element);
        var terrain = elementStorage.getElementFromBlockIndex(newIndex, op_def.NodeType.TerrainNodeType);
        this.room.terrainManager.addDisplayRef(terrain);
        this.preBlockIndex = blockIndex;
    };
    return BlockIndexManager;
}());
export { BlockIndexManager };
//# sourceMappingURL=block.index.manager.js.map