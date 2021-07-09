var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { Tool } from "utils";
import { GameState, Logger, LoadState } from "structure";
import { PBpacket } from "net-socket-packet";
import { op_gateway, op_client, op_virtual_world } from "pixelpai_proto";
const IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { BaseState } from "./base.state";
export class EnterWorldState extends BaseState {
  constructor(main, key) {
    super(main, key);
    __publicField(this, "isSyncPackage", false);
    __publicField(this, "remoteIndex", 0);
  }
  run() {
    super.run();
    this.addPacketListener();
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
    Logger.getInstance().debug("loginEnterWorld");
    const version = this.mMain.config.version;
    this.mGame.loadingManager.start(LoadState.ENTERWORLD, { render: `\u6784\u5EFA\u73B0\u5B9E\u4E16\u754C_v${version}`, main: `\u6784\u5EFA\u9B54\u6CD5\u4E16\u754C_v${version}`, physical: `\u6784\u5EFA\u7269\u7406\u4E16\u754C_v${version}` }).then(this.mGame.renderPeer.hideLogin());
    const pkt = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
    const content = pkt.content;
    const config = this.mGame.getGameConfig();
    Logger.getInstance().debug(`VW_id: ${config.virtual_world_id}`);
    let game_id = config.game_id;
    let virtualWorldUuid = config.virtual_world_id;
    const worldId = config.world_id;
    let sceneId = null;
    let loc = null;
    let spawnPointId = null;
    this.mGame.peer.render.getAccount().then((account) => {
      const accountData = account.accountData;
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
      content.loc = loc || { locX: 0, locY: 0, locZ: 0 };
      content.spawnPointId = spawnPointId;
      this.mGame.connection.send(pkt);
      if (this.mGame.clock)
        this.mGame.clock.startCheckTime();
      if (this.mGame.httpClock)
        this.mGame.httpClock.gameId = game_id;
    });
  }
  update(data) {
  }
  next() {
    super.next();
    this.mGame.gameStateManager.state = GameState.GameRunning;
    this.mGame.gameStateManager.startRun();
  }
  onInitVirtualWorldPlayerInit(packet) {
    return __async(this, null, function* () {
      const clock = this.mGame.clock;
      Logger.getInstance().debug("onInitVirtualWorldPlayerInit");
      const content = packet.content;
      const configUrls = content.configUrls;
      if (content.resourceRoot)
        this.mMain.render.setResourecRoot(content.resourceRoot[0]);
      clock.sync(-1);
      this.initgameConfigUrls(configUrls);
      const account = yield this.mGame.peer.render.getAccount();
      if (!configUrls || configUrls.length <= 0) {
        Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${account.gameID}`);
        this.mGame.peer.render.createGameCallBack(content.keyEvents);
        this.gameCreated();
        return;
      }
      Logger.getInstance().debug(`mMoveStyle:${content.moveStyle}`);
      let game_id = account.gameId;
      if (game_id === void 0) {
        Logger.getInstance().log("!game_ID");
        this.mGame.peer.render.createGameCallBack(content.keyEvents);
        this.gameCreated();
        return;
      }
      Logger.getInstance().debug("WorldPlayerInit");
      if (game_id.indexOf(".") > -1) {
        game_id = game_id.split(".")[1];
      }
      const mainGameConfigUrl = this.mGame.gameConfigUrl;
      this.mGame.loadingManager.start(LoadState.DOWNLOADGAMECONFIG);
      Logger.getInstance().debug("onInitVirtualWorldPlayerInit====loadGameConfig");
      this.isSyncPackage = false;
      this.mGame.roomManager.loadGameConfig(mainGameConfigUrl).then((gameConfig) => {
        this.mGame.elementStorage.setGameConfig(gameConfig);
        this.mGame.peer.render.createGameCallBack(content.keyEvents);
        this.gameCreated();
        Logger.getInstance().log("created game suc");
      }).catch((err) => {
        Logger.getInstance().error(err);
      });
    });
  }
  initgameConfigUrls(urls) {
    for (const url of urls) {
      const sceneId = Tool.baseName(url);
      this.mGame.gameConfigUrls.set(sceneId, url);
      this.mGame.gameConfigState.set(url, false);
      if (url.split(sceneId).length === 3) {
        this.mGame.gameConfigUrl = url;
      }
    }
  }
  gameCreated() {
    if (this.mConnect) {
      Logger.getInstance().debug("connection gameCreat");
      this.mGame.loadingManager.start(LoadState.WAITENTERROOM);
      const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
      this.mConnect.send(pkt);
    } else {
      Logger.getInstance().debug("no connection gameCreat");
    }
  }
}
