import "phaser";
import { WorldService } from "./world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "phaser";
import { IConnectListener, SocketConnection, SocketConnectionError } from "../net/socket";
import { ConnectionService } from "../net/connection.service";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { op_gateway, op_client, op_virtual_world } from "pixelpai_proto";
import Connection from "../net/connection";
import { LoadingScene } from "../scenes/loading";
import { SelectCharacter } from "../scenes/select.character";
import { PlayScene } from "../scenes/play";
import { RoomManager } from "../rooms/room.manager";
import { SceneType } from "../const/scene.type";
import { ServerAddress } from "../net/address";
import { IGameConfigure } from "../../launcher";
import { KeyBoardManager } from "./keyboard.manager";
import { MouseManager } from "./mouse.manager";
import { Room } from "../rooms/room";
import { SelectManager } from "../rooms/player/select.manager";
import { LoadingManager } from "./loading.manager";

// TODO 这里有个问题，需要先连socket获取游戏初始化的数据，所以World并不是Phaser.Game 而是驱动 Phaser.Game的驱动器
// TODO 让World成为一个以socket连接为基础的类，因为没有连接就不运行游戏
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService {
    private mConnection: ConnectionService | undefined;
    private mGame: Phaser.Game | undefined;
    private mConfig: IGameConfigure | undefined;
    private mSelectCharacterManager: SelectManager;
    private mRoomMamager: RoomManager;
    private mKeyBoardManager: KeyBoardManager;
    private mMouseManager: MouseManager;
    private mLoadingManager: LoadingManager;

    constructor(config: IGameConfigure) {
        super();
        this.mConfig = config;

        this.mConnection = new Connection(this);
        this.mConnection.addPacketListener(this);
        // add Packet listener.
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);

        //================todo opcode
        this.addHandlerFun(0, this.startSelectManager);
        //this.addHandlerFun(1, this.startRoomManager);
        this.addHandlerFun(2, this.stopSelectManager);
        //this.addHandlerFun(3, this.stopRoomManager);


        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;

        this.mRoomMamager = new RoomManager(this);
        this.mSelectCharacterManager = new SelectManager(this);
        this.mKeyBoardManager = new KeyBoardManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mLoadingManager = new LoadingManager(this);

        if (gateway) { // connect to game server.
            this.mConnection.startConnect(gateway);
        }
    }

    get game(): Phaser.Game | undefined {
        return this.mGame;
    }

    get roomManager(): RoomManager | undefined {
        return this.mRoomMamager;
    }

    get selectCharacterManager(): SelectManager | undefined {
        return this.selectCharacterManager;
    }




    get connection(): ConnectionService {
        return this.mConnection;
    }

    private enterVirtualWorld() {
        if (this.mConfig && this.mConnection) {
            let pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
            let content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
            content.virtualWorldUuid = this.mConfig.virtual_world_id;
            content.gameId = this.mConfig.game_id;
            content.userToken = this.mConfig.auth_token;
            content.expire = this.mConfig.token_expire;
            content.fingerprint = this.mConfig.token_fingerprint;
            this.mConnection.send(pkt);
        }
    }

    onConnected(connection?: SocketConnection): void {
        console.info(`enterVirtualWorld`);
        this.enterVirtualWorld();
    }

    onDisConnected(connection?: SocketConnection): void {

    }

    onError(reason: SocketConnectionError | undefined): void {

    }

    onClientErrorHandler(packet: PBpacket): void {
        let content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        console.error(content.msg);
    }

    private startSelectManager(packet: PBpacket) {
        let content = packet.content;
        this.mSelectCharacterManager.start();
    }

    // public startRoomManager() {
    //     this.mRoomMamager.start();
    // }

    private stopSelectManager(packet: PBpacket) {
        let content = packet.content;
        this.mSelectCharacterManager.stop();
    }

    private stopRoomManager(packet: PBpacket) {
        let content = packet.content;
        this.mRoomMamager.stop();
    }

    /**
     * 当scene发生改变时，调用该方法并传入各个需要调整监听的manager中去
     */
    // public changeSceneToManager() {
    //     let room: Room = this.mRoomMamager.getCurRoom();
    //     this.mKeyBoardManager.setSceneToManager(room);
    //     this.mMouseManager.setSceneToManager(room);
    // }

    public getWidth(): number {
        return this.mGame != undefined ? this.mGame.scale.width : 0;
    }

    public getHeight(): number {
        return this.mGame != undefined ? this.mGame.scale.height : 0;
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // // TODO 进游戏前预加载资源
        // this.mLoadingManager.start(()=>{
        // });

        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        console.dir(content);
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        if (this.mGame) {
            this.mGame.scale.off("resize", this.resize, this);
            this.mGame.destroy(true);
        }
        this.mGame = new Game(this.mConfig);
        this.mGame.scene.add(SceneType.Loading, LoadingScene);
        this.mGame.scene.add(SceneType.SelectCharacter, SelectCharacter);
        this.mGame.scene.add(SceneType.Play, PlayScene);

        //==================todo 请求选择角色信息
        let pkt: PBpacket = new PBpacket(0);
        this.mConnection.send(pkt);

        // window.addEventListener("orientationchange", function(event) {
        //     // 根据event.orientation|screen.orientation.angle等于0|180、90|-90度来判断横竖屏
        // }, false);
        // this.mSelectCharacterManager.start();

        this.mGame.scale.on("resize", this.resize, this);

        this.gameCreated();
    }

    private resize(gameSize, baseSize, displaySize, resolution) {
        //TODO manager.resize
    }

    private gameCreated() {
        if (this.connection) {
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
        } else {
            console.error("connection is undefined")
        }
    }
}
