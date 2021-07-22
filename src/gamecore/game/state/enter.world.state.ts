import { load, ResUtils, Tool, Url } from "utils";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
import { EventType, GameState, Logger, LoadState } from "structure";
import { PBpacket } from "net-socket-packet";
import { op_gateway, op_client, op_virtual_world, op_def } from "pixelpai_proto";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { Capsule } from "game-capsule";
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
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
        Logger.getInstance().debug("loginEnterWorld");
        const version = this.mMain.config.version;
        this.mGame.loadingManager
            .start(LoadState.ENTERWORLD, { render: "构建现实世界" + `_v${version}`, main: "构建魔法世界" + `_v${version}`, physical: "构建物理世界" + `_v${version}` })
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
        if (content.resourceRoot) Url.RESOURCE_ROOT = content.resourceRoot[0];
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
        this.mGame.loadingManager.start(LoadState.DOWNLOADGAMECONFIG);
        Logger.getInstance().debug("onInitVirtualWorldPlayerInit====loadGameConfig");
        // 每次加载，重新请求数据
        this.isSyncPackage = false;
        this.loadGameConfig(mainGameConfigUrl)
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

    protected loadGameConfig(remotePath): Promise<Capsule> {
        const game = this.mMain.game;
        const config = game.getGameConfig();
        const configPath = ResUtils.getGameConfig(remotePath);
        return load(configPath, "arraybuffer").then((req: any) => {
            this.mGame.gameConfigState.set(remotePath, true);
            game.loadingManager.start(LoadState.PARSECONFIG);
            Logger.getInstance().debug("start decodeConfig");
            return this.decodeConfigs(req);
        }, (reason) => {
            if (this.remoteIndex > 3) {
                if (config.hasReload) {
                    // app reload
                } else {
                    Logger.getInstance().log(reason);
                    game.renderPeer.reload();
                }
                return;
            }
            this.remoteIndex++;
            Logger.getInstance().error("reload res ====>", reason, "reload count ====>", this.remoteIndex);
            return this.loadGameConfig(remotePath);
        });
    }

    protected decodeConfigs(req): Promise<Capsule> {
        return new Promise((resolve, reject) => {
            const arraybuffer = req.response;
            if (arraybuffer) {
                try {
                    const gameConfig = new Capsule();
                    gameConfig.deserialize(new Uint8Array(arraybuffer));
                    Logger.getInstance().debug("TCL: World -> gameConfig", gameConfig);
                    resolve(gameConfig);
                } catch (error) {
                    Logger.getInstance().error("catch error", error);
                    reject(error);
                }
            } else {
                Logger.getInstance().error("reject error");
                reject("error");
            }
        });
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

    // ========> 进入房间流程
    protected onEnterSceneHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        const scene = content.scene;
        switch (scene.sceneType) {
            case op_def.SceneTypeEnum.NORMAL_SCENE_TYPE:
                this.onEnterScene(content);
                break;
            case op_def.SceneTypeEnum.EDIT_SCENE_TYPE:
                Logger.getInstance().error("error message: scene.sceneType === EDIT_SCENE_TYPE");
                break;
        }
        this.mGame.emitter.emit(EventType.SCENE_CHANGE);
    }

    protected async onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        const vw = scene;
        const roomManager = this.mGame.roomManager;
        const curRoom = roomManager.currentRoom;
        if (curRoom) {
            // 客户端会接受到多次进入场景消息，这边客户端自己处理下，防止一个房间多次创建
            if (curRoom.id === vw.scene.id) return;
            await roomManager.leaveRoom(curRoom);
        }
        if (roomManager.hasRoom(vw.scene.id)) {
            roomManager.onEnterRoom(scene);
        } else {
            this.loadSceneConfig(vw.scene.id.toString()).then(async (config: Capsule) => {
                this.mGame.elementStorage.setSceneConfig(config);
                roomManager.onEnterRoom(scene);
                // ====> 游戏开始运行
                this.next();
            });
        }
    }

    protected loadSceneConfig(sceneID: string): Promise<any> {
        const remotePath = this.getConfigUrl(sceneID);
        this.mGame.loadingManager.start(LoadState.DOWNLOADSCENECONFIG);
        const render = this.mGame.renderPeer;
        const result = this.mGame.preloadGameConfig();
        if (result === undefined) {
            return this.loadGameConfig(remotePath);
        } else {
            return result.then((req: any) => {
                return this.loadGameConfig(remotePath);
            }, (reason) => {
                return new Promise((resolve, reject) => {
                    render.showAlert("配置加载错误，请重新登陆" + reason, true, false)
                        .then(() => {
                            if (!this.mGame.debugReconnect) return;
                            render.hidden();
                        });
                    reject();
                });
            });
        }
    }

    protected getConfigUrl(sceneId: string) {
        return this.mGame.gameConfigUrls.get(sceneId);
    }
}
