import { op_client, op_def } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { IRoomService, Room } from "./room";
import { ConnectionService, EventType, LoadState, Logger } from "structure";
import { Capsule } from "game-capsule";
import { ConfigPath } from "../config";
import { load } from "utils";

export interface IRoomManager {
    readonly game: Game | undefined;

    readonly currentRoom: IRoomService | undefined;

    readonly connection: ConnectionService | undefined;

    removeAllRoom();

    addPackListener();

    removePackListener();
}

export class RoomManager extends PacketHandler implements IRoomManager {
    protected mGame: Game;
    protected mRooms: IRoomService[] = [];
    protected mCurRoom: IRoomService;
    protected remoteIndex: number = 0;
    constructor(game: Game) {
        super();
        this.mGame = game;
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM, this.onEnterResult);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_READY, this.onEnterDecorate);
    }

    public update(time: number, delay: number) {
        if (this.mCurRoom) this.mCurRoom.update(time, delay);
    }

    public addPackListener() {
        if (this.connection) {
            Logger.getInstance().debug("roommanager addPackListener");
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            Logger.getInstance().debug("roommanager removePackListener");
            this.connection.removePacketListener(this);
        }
    }

    public getRoom(id: number): IRoomService | undefined {
        return this.mRooms.find((room: Room) => {
            return room.id === id;
        });
    }

    public onFocus() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.resume();
        });
    }

    public onBlur() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.pause();
        });
    }

    public stop() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.destroy();
        });
    }

    public removeAllRoom() {
        for (let room of this.mRooms) {
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
        this.mCurRoom = null;
    }

    public hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    public async leaveRoom(room: IRoomService) {
        if (!room) return;
        this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
        room.destroy();
    }

    public onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        Logger.getInstance().debug("enter===room");
        const id = scene.scene.id;
        let boo: boolean = false;
        // tslint:disable-next-line:no-shadowed-variable
        this.mRooms.forEach((room) => {
            if (room && room.id === id) {
                boo = true;
                return;
            }
        });
        if (boo) return;
        const room = new Room(this);
        this.mRooms.push(room);
        // create curRoom
        this.mCurRoom = room;
        room.addActor(scene.actor);
        // create playScene
        room.enter(scene.scene);
        this.game.emitter.emit("EnterRoom");
    }

    public destroy() {
        this.removePackListener();
        this.removeAllRoom();
    }

    public loadGameConfig(remotePath): Promise<Capsule> {
        const game = this.game;
        const config = game.getGameConfig();
        const configPath = ConfigPath.getSceneConfigUrl(remotePath);
        this.game.setCurSceneConfigUrl(configPath);
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

    public decodeConfigs(req): Promise<Capsule> {
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
                this.mGame.gameStateManager.next();
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

    private onEnterEditor(packet: PBpacket) {
        // const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        // const room = new EditorRoom(this);
        // room.enter(content.scene);
        // this.mCurRoom = room;
        // this.mRooms.push(room);
    }

    private onEnterResult(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM = packet.content;
        if (!content.result) {
            return;
        }
        const tips = [undefined, "commontips.room_full", "commontips.room_need_password", "commontips.room_password_failure", "commontips.room_dose_not_exists"];
        const tip = tips[content.result - 1];
        if (tip) this.game.renderPeer.showAlert(tip);
    }

    get game(): Game {
        return this.mGame;
    }

    get currentRoom(): IRoomService {
        return this.mCurRoom;
    }

    get connection(): ConnectionService {
        if (this.mGame) {
            return this.mGame.connection;
        }
    }
}
