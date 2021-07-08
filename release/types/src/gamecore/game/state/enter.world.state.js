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
import { Tool } from "utils";
import { GameState, Logger, LoadState } from "structure";
import { PBpacket } from "net-socket-packet";
import { op_gateway, op_client, op_virtual_world } from "pixelpai_proto";
import { BaseState } from "./base.state";
var EnterWorldState = /** @class */ (function (_super) {
    __extends_1(EnterWorldState, _super);
    function EnterWorldState(main, key) {
        var _this = _super.call(this, main, key) || this;
        _this.isSyncPackage = false;
        _this.remoteIndex = 0;
        return _this;
    }
    EnterWorldState.prototype.run = function () {
        var _this = this;
        _super.prototype.run.call(this);
        this.addPacketListener();
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        Logger.getInstance().debug("loginEnterWorld");
        var version = this.mMain.config.version;
        this.mGame.loadingManager
            .start(LoadState.ENTERWORLD, { render: "构建现实世界" + ("_v" + version), main: "构建魔法世界" + ("_v" + version), physical: "构建物理世界" + ("_v" + version) })
            .then(this.mGame.renderPeer.hideLogin());
        // =============> 向服务器发送_OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
        var pkt = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        var content = pkt.content;
        var config = this.mGame.getGameConfig();
        Logger.getInstance().debug("VW_id: " + config.virtual_world_id);
        var game_id = config.game_id;
        var virtualWorldUuid = config.virtual_world_id;
        var worldId = config.world_id;
        var sceneId = null;
        var loc = null;
        var spawnPointId = null;
        this.mGame.peer.render.getAccount().then(function (account) {
            var accountData = account.accountData;
            if (account && account.gameId) {
                game_id = account.gameId;
                virtualWorldUuid = account.virtualWorldId;
                sceneId = account.sceneID;
                loc = account.loc;
                spawnPointId = account.spawnPointId;
            }
            content.virtualWorldUuid = virtualWorldUuid;
            content.gameId = game_id;
            content.userToken = config.auth_token = accountData.accessToken;
            content.expire = config.token_expire = accountData.expire + "";
            content.fingerprint = config.token_fingerprint = accountData.fingerprint;
            content.sceneId = sceneId;
            content.worldUuid = worldId;
            // 后端有个Bug，loc是undefined位置会错误。修复后删掉{ locX: 0, locY: 0, locZ: 0}
            content.loc = loc || { locX: 0, locY: 0, locZ: 0 };
            content.spawnPointId = spawnPointId;
            _this.mGame.connection.send(pkt);
            if (_this.mGame.clock)
                _this.mGame.clock.startCheckTime();
            if (_this.mGame.httpClock)
                _this.mGame.httpClock.gameId = game_id;
        });
    };
    EnterWorldState.prototype.update = function (data) {
    };
    EnterWorldState.prototype.next = function () {
        _super.prototype.next.call(this);
        this.mGame.gameStateManager.state = GameState.GameRunning;
        this.mGame.gameStateManager.startRun();
    };
    // =============> EnterWorldState 内部逻辑
    // ========> 加载pi解析pi流程
    /**
     * 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT协议后，开始处理pi
     * @param packet
     * @returns
     */
    EnterWorldState.prototype.onInitVirtualWorldPlayerInit = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var clock, content, configUrls, account, game_id, mainGameConfigUrl;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clock = this.mGame.clock;
                        Logger.getInstance().debug("onInitVirtualWorldPlayerInit");
                        content = packet.content;
                        configUrls = content.configUrls;
                        if (content.resourceRoot)
                            this.mMain.render.setResourecRoot(content.resourceRoot[0]);
                        clock.sync(-1);
                        this.initgameConfigUrls(configUrls);
                        return [4 /*yield*/, this.mGame.peer.render.getAccount()];
                    case 1:
                        account = _a.sent();
                        if (!configUrls || configUrls.length <= 0) {
                            Logger.getInstance().error("configUrls error: , " + configUrls + ", gameId: " + account.gameID);
                            this.mGame.peer.render.createGameCallBack(content.keyEvents);
                            this.gameCreated();
                            return [2 /*return*/];
                        }
                        Logger.getInstance().debug("mMoveStyle:" + content.moveStyle);
                        game_id = account.gameId;
                        if (game_id === undefined) {
                            Logger.getInstance().log("!game_ID");
                            this.mGame.peer.render.createGameCallBack(content.keyEvents);
                            this.gameCreated();
                            return [2 /*return*/];
                        }
                        Logger.getInstance().debug("WorldPlayerInit");
                        if (game_id.indexOf(".") > -1) {
                            game_id = game_id.split(".")[1];
                        }
                        mainGameConfigUrl = this.mGame.gameConfigUrl;
                        this.mGame.loadingManager.start(LoadState.DOWNLOADGAMECONFIG);
                        Logger.getInstance().debug("onInitVirtualWorldPlayerInit====loadGameConfig");
                        // 每次加载，重新请求数据
                        this.isSyncPackage = false;
                        this.mGame.roomManager.loadGameConfig(mainGameConfigUrl)
                            .then(function (gameConfig) {
                            _this.mGame.elementStorage.setGameConfig(gameConfig);
                            _this.mGame.peer.render.createGameCallBack(content.keyEvents);
                            _this.gameCreated();
                            Logger.getInstance().log("created game suc");
                        })
                            .catch(function (err) {
                            Logger.getInstance().error(err);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    EnterWorldState.prototype.initgameConfigUrls = function (urls) {
        for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
            var url = urls_1[_i];
            var sceneId = Tool.baseName(url);
            this.mGame.gameConfigUrls.set(sceneId, url);
            this.mGame.gameConfigState.set(url, false);
            if (url.split(sceneId).length === 3) {
                this.mGame.gameConfigUrl = url;
            }
        }
    };
    EnterWorldState.prototype.gameCreated = function () {
        if (this.mConnect) {
            Logger.getInstance().debug("connection gameCreat");
            this.mGame.loadingManager.start(LoadState.WAITENTERROOM);
            var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.mConnect.send(pkt);
        }
        else {
            Logger.getInstance().debug("no connection gameCreat");
        }
    };
    return EnterWorldState;
}(BaseState));
export { EnterWorldState };
//# sourceMappingURL=enter.world.state.js.map