import "phaser";
import "dragonBones";
import { WorldService } from "./world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "phaser";
import { IConnectListener, SocketConnection, SocketConnectionError } from "../net/socket";
import { ConnectionService } from "../net/connection.service";
import { op_client, op_def, op_gateway, op_virtual_world, op_gameconfig } from "pixelpai_proto";
import Connection from "../net/connection";
import { LoadingScene } from "../scenes/loading";
import { PlayScene } from "../scenes/play";
import { RoomManager } from "../rooms/room.manager";
import { ServerAddress } from "../net/address";
import { KeyBoardManager } from "./keyboard.manager";
import { MouseManager } from "./mouse.manager";
import { SelectManager } from "../rooms/player/select.manager";
import { Size } from "../utils/size";
import { IRoomService } from "../rooms/room";
import { MainUIScene } from "../scenes/main.ui";
import { Logger } from "../utils/log";
import { JoyStickManager } from "./joystick.manager";
import { GameMain, ILauncherConfig } from "../../launcher";
import { ElementStorage, IElementStorage } from "./element.storage";
import { load } from "../utils/http";
import { ResUtils } from "../utils/resUtil";
import { Lite } from "game-capsule";
import { UiManager } from "../ui/ui.manager";
import NinePatchPlugin from "../../lib/rexui/plugins/ninepatch-plugin.js";
import InputTextPlugin from "../../lib/rexui/plugins/inputtext-plugin.js";
import BBCodeTextPlugin from "../../lib/rexui/plugins/bbcodetext-plugin.js";
import ButtonPlugin from "../../lib/rexui/plugins/button-plugin.js";
import UIPlugin from "../../lib/rexui/templates/ui/ui-plugin.js";
import { InputManager } from "./input.service";
import { ModelManager } from "../service/modelManager";
import { PI_EXTENSION_REGEX } from "../const/constants";
import { LoginScene } from "../scenes/login";
import { Account } from "./account";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService, GameMain {

    private mConnection: ConnectionService | undefined;
    private mGame: Phaser.Game | undefined;
    private mRoomMamager: RoomManager;
    private mMouseManager: MouseManager;
    private mElementStorage: IElementStorage;
    private mUiManager: UiManager;
    private mConfig: ILauncherConfig;
    private mCallBack: Function;
    private mInputManager: InputManager;
    private mModelManager: ModelManager;
    private mAccount: Account;

    constructor(config: ILauncherConfig, callBack?: Function) {
        super();
        this.mCallBack = callBack;
        this.mConfig = config;
        // TODO 检测config内的必要参数如确实抛异常.
        if (!config.game_id) {
            throw new Error(`Config.game_id is required.`);
        }
        this._newGame();
        this.mConnection = new Connection(this);
        this.mConnection.addPacketListener(this);
        // add Packet listener.
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);

        this.mRoomMamager = new RoomManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mUiManager = new UiManager(this);
        this.mElementStorage = new ElementStorage();

        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) { // connect to game server.
            this.mConnection.startConnect(gateway);
        }
    }

    destroy(): void {
        // TODO
    }

    onConnected(connection?: SocketConnection): void {
        Logger.info(`enterVirtualWorld`);
        this.enterVirtualWorld();
        // this.login();
    }

    onDisConnected(connection?: SocketConnection): void {

    }

    onError(reason: SocketConnectionError | undefined): void {

    }

    onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Logger.error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }

    /**
     * 当scene发生改变时，调用该方法并传入各个需要调整监听的manager中去
     */
    public changeRoom(room: IRoomService) {
        if (this.mGame.device.os.desktop) {
            this.mInputManager.onRoomChanged(room);
        }
        this.mMouseManager.changeRoom(room);
    }

    public getSize(): Size | undefined {
        if (!this.mGame) return;
        return this.mGame.scale.gameSize;
    }

    public resize(width: number, height: number) {
        if (this.mGame) {
            this.mGame.scale.resize(width, height);
        }
        if (this.mRoomMamager) {
            this.mRoomMamager.resize(width, height);
        }
        if (this.mUiManager) {
            this.mUiManager.resize(width, height);
        }
        if (this.mInputManager) {
            this.mInputManager.resize(width, height);
        }
        // TODO manager.resize
    }

    get uiScale(): number {
        if (this.mConfig)
            return this.mConfig.ui_scale;
        return 1;
    }

    get game(): Phaser.Game | undefined {
        return this.mGame;
    }

    get roomManager(): RoomManager | undefined {
        return this.mRoomMamager;
    }

    get elementStorage(): IElementStorage | undefined {
        return this.mElementStorage;
    }

    get selectCharacterManager(): SelectManager | undefined {
        return this.selectCharacterManager;
    }

    get uiManager(): UiManager | undefined {
        return this.mUiManager;
    }

    get inputManager(): InputManager | undefined {
        return this.mInputManager;
    }

    get connection(): ConnectionService {
        return this.mConnection;
    }

    get modelManager(): ModelManager | undefined {
        return this.mModelManager;
    }

    get account(): Account {
        return this.mAccount;
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.connection.send(pkt);
    }

    private login() {
        if (!this.mGame.scene.getScene(LoginScene.name)) {
            this.mGame.scene.add(LoginScene.name, LoginScene);
        }
        // const loadingScene: LoadingScene = this.mGame.scene.getScene(LoadingScene.name) as LoadingScene;
        // if (!loadingScene) {
        //     this.mGame.scene.add(LoadingScene.name, LoadingScene);
        // }
        this.mGame.scene.start(LoginScene.name, {
            connect: this.mConnection,
            world: this,
            callBack: () => {
                this.loginEnterWorld();
                const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
                loginScene.remove();
                this.mGame.scene.start(LoadingScene.name, { world: this });
            },
        });
    }

    private enterVirtualWorld() {
        if (this.mConfig && this.mConnection) {
            this.mAccount = new Account();
            const loadingScene: LoadingScene = this.mGame.scene.getScene(LoadingScene.name) as LoadingScene;
            if (!loadingScene) {
                this.mGame.scene.add(LoadingScene.name, LoadingScene);
            }
            if (!this.mConfig.auth_token) {
                this.login();
                return;
            } else {
                this.mGame.scene.start(LoadingScene.name, { world: this });
                this.mAccount.setAccount({
                    data: {
                        token: this.mConfig.auth_token,
                        expire: this.mConfig.token_expire,
                        fingerprint: this.mConfig.token_fingerprint
                    }
                });
            }
            this.loginEnterWorld();
        }
    }

    private loginEnterWorld() {
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        Logger.log(`VW_id: ${this.mConfig.virtual_world_id}`);
        content.virtualWorldUuid = `${this.mConfig.virtual_world_id}`;
        content.gameId = this.mConfig.game_id;
        // const accountObj = JSON.parse();
        content.userToken = this.mAccount.accountData.token; // auth_token;
        content.expire = this.mAccount.accountData.expire + "";
        content.fingerprint = this.mAccount.accountData.fingerprint;
        this.mConnection.send(pkt);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        if (!configUrls || configUrls.length <= 0) {
            Logger.error(`configUrls error: , ${configUrls}, gameId: ${this.mConfig.game_id}`);
        }
        // Logger.log("start download gameConfig");
        this.loadGameConfig(content.configUrls)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.createGame(content.keyEvents);
                Logger.debug("created game suc");
            })
            .catch((err) => {
                Logger.log(err);
            });
    }

    private _newGame(): Phaser.Game {
        if (this.mGame) {
            return this.mGame;
        }
        const gameConfig: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            zoom: 1,
            parent: "game",
            scene: null,
            disableContextMenu: true,
            transparent: false,
            backgroundColor: 0x0,
            resolution: 1,
            fps: {
                target: 60
            },
            dom: {
                createContainer: true
            },
            plugins: {
                global: [{
                    key: "rexButton",
                    plugin: ButtonPlugin,
                    start: true
                },
                {
                    key: "rexNinePatchPlugin",
                    plugin: NinePatchPlugin,
                    start: true
                },
                {
                    key: "rexInputText",
                    plugin: InputTextPlugin,
                    start: true
                },
                {
                    key: "rexBBCodeTextPlugin",
                    plugin: BBCodeTextPlugin,
                    start: true
                }],
                scene: [
                    {
                        key: "DragonBones",
                        plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                        mapping: "dragonbone",
                    },
                    { key: "rexUI", plugin: UIPlugin, mapping: "rexUI" }
                ]
            },
            render: {
                pixelArt: true,
                roundPixels: true
            }
        };

        Object.assign(gameConfig, this.mConfig);
        return this.mGame = new Game(gameConfig);
    }

    private createGame(keyEvents?: op_def.IKeyCodeEvent[]) {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        this._newGame();
        this.mGame.scene.add(PlayScene.name, PlayScene);
        this.mGame.scene.add(MainUIScene.name, MainUIScene);
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.mModelManager = new ModelManager(this);
        if (this.mGame.device.os.desktop) {
            this.mInputManager = new KeyBoardManager(this, keyEvents);
        } else {
            this.mInputManager = new JoyStickManager(this, keyEvents);
        }
        this.gameCreated();
    }

    private gameCreated() {
        if (this.connection) {
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
            if (this.mCallBack) {
                this.mCallBack();
            }
        } else {
            Logger.error("connection is undefined");
        }
    }

    private loadGameConfig(paths: string[]): Promise<Lite> {
        const promises = [];
        let configPath = "";
        for (const path of paths) {
            if (PI_EXTENSION_REGEX.test(path)) {
                configPath = ResUtils.getGameConfig(path);
                Logger.log(`start download config: ${configPath}`);
                promises.push(load(configPath, "arraybuffer"));
            }
        }
        // TODO Promise.all如果其中有一个下载失败，会返回error
        return Promise.all(promises)
            .then((reqs: any[]) => {
                Logger.log("start decodeConfig");
                return this.decodeConfigs(reqs);
            });
    }

    private decodeConfigs(reqs: any[]): Promise<Lite> {
        return new Promise((resolve, reject) => {
            for (const req of reqs) {
                const arraybuffer = req.response;
                if (arraybuffer) {
                    try {
                        const gameConfig = new Lite();
                        gameConfig.deserialize(new Uint8Array(arraybuffer));
                        resolve(gameConfig);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject("error");
                }
            }
        });
    }

    private onFocus() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this.connection.send(pkt);
            this.mRoomMamager.onFocus();
        } else {
            Logger.error("connection is undefined");
        }
    }

    private onBlur() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
            this.mRoomMamager.onBlur();
        } else {
            Logger.error("connection is undefined");
        }
    }
}
