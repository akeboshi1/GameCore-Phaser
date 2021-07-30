import { Tool } from "utils";
import { MainPeer } from "../main.peer";
import { GameState, Logger, LoadState } from "structure";
import { PBpacket } from "net-socket-packet";
import { op_gateway, op_client, op_virtual_world } from "pixelpai_proto";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { Capsule } from "game-capsule";
import { BaseState } from "./base.state";
export class EnterWorldState extends BaseState {
    protected isSyncPackage: boolean = false;
    protected remoteIndex = 0;
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }

    run() {
        super.run();
        this.addPacketListener();
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        Logger.getInstance().debug("loginEnterWorld");
        const version = this.mMain.config.version;
        this.mGame.loadingManager
            .start(LoadState.ENTERWORLD)
            .then(this.mGame.renderPeer.hideLogin());
        // =============> 向服务器发送_OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
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
            // 后端有个Bug，loc是undefined位置会错误。修复后删掉{ locX: 0, locY: 0, locZ: 0}
            content.loc = loc || { locX: 0, locY: 0, locZ: 0 };
            content.spawnPointId = spawnPointId;
            this.mGame.connection.send(pkt);
            if (this.mGame.clock) this.mGame.clock.startCheckTime();
            if (this.mGame.httpClock) this.mGame.httpClock.gameId = game_id;
        });
    }
    update(data?: any) {

    }
    next() {
        super.next();
        this.mGame.gameStateManager.state = GameState.GameRunning;
        this.mGame.gameStateManager.startRun();
    }

    // =============> EnterWorldState 内部逻辑
    // ========> 加载pi解析pi流程
    /**
     * 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT协议后，开始处理pi
     * @param packet
     * @returns
     */
    protected async onInitVirtualWorldPlayerInit(packet: PBpacket) {
        const clock = this.mGame.clock;
        Logger.getInstance().debug("onInitVirtualWorldPlayerInit");
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        if (content.resourceRoot) this.mMain.render.setResourecRoot(content.resourceRoot[0]);
        clock.sync(-1);

        this.initgameConfigUrls(configUrls);
        const account = await this.mGame.peer.render.getAccount();
        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${account.gameID}`);
            this.mGame.peer.render.createGameCallBack(content.keyEvents);
            this.gameCreated();
            return;
        }
        Logger.getInstance().debug(`mMoveStyle:${content.moveStyle}`);
        let game_id = account.gameId;
        if (game_id === undefined) {
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
        if (this.mGame.loadingManager) this.mGame.loadingManager.start(LoadState.DOWNLOADGAMECONFIG);
        Logger.getInstance().debug("onInitVirtualWorldPlayerInit====loadGameConfig");
        // 每次加载，重新请求数据
        this.isSyncPackage = false;
        this.mGame.roomManager.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Capsule) => {
                this.mGame.elementStorage.setGameConfig(gameConfig);
                this.mGame.peer.render.createGameCallBack(content.keyEvents);
                this.gameCreated();
                Logger.getInstance().log("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().error(err);
            });
    }

    protected initgameConfigUrls(urls: string[]) {
        for (const url of urls) {
            const sceneId = Tool.baseName(url);
            this.mGame.gameConfigUrls.set(sceneId, url);
            this.mGame.gameConfigState.set(url, false);
            if (url.split(sceneId).length === 3) {
                this.mGame.gameConfigUrl = url;
            }
        }
    }

    protected gameCreated() {
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
