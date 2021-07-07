import { Capsule } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { EventType, LoadState, Logger } from "structure";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
import { load } from "utils";
import { op_client, op_def } from "pixelpai_proto";

export class BaseEnterSceneState extends BaseState {
    protected remoteIndex: number = 0;
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }

    run() {
        super.run();
        this.addPacketListener();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
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

    protected async loadGameConfig(remotePath): Promise<Capsule> {
        const game = this.mMain.game;
        const config = game.getGameConfig();
        const configPath = await this.mMain.render.getGameConfig(remotePath);
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

    protected getConfigUrl(sceneId: string) {
        return this.mGame.gameConfigUrls.get(sceneId);
    }
}
