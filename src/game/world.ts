import "phaser";
import {WorldService} from "./world.service";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {Game} from "phaser";
import {IConnectListener, SocketConnection, SocketConnectionError} from "../net/socket";
import {IGameConfigure} from "../../launcher";
import {ConnectionService} from "../net/connection.service";
import Connection from "../net/connection";
import {ServerAddress} from "../net/address";
import {op_client, op_gameconfig, op_gateway, op_virtual_world} from "pixelpai_proto";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;

PBpacket.addProtocol(op_client);
PBpacket.addProtocol(op_gateway);
PBpacket.addProtocol(op_gameconfig);
PBpacket.addProtocol(op_virtual_world);

// TODO 这里有个问题，需要先连socket获取游戏初始化的数据，所以World并不是Phaser.Game 而是驱动 Phaser.Game的驱动器
// TODO 让World成为一个以socket连接为基础的类，因为没有连接就不运行游戏
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService {
    private mConnection: ConnectionService;
    private mGame: Phaser.Game;
    private mConfig: IGameConfigure;

    constructor(config: IGameConfigure) {
        super();
        this.mConfig = config;

        this.mConnection = new Connection(this);
        this.mConnection.addPacketListener(this);
        // add Packet listener.
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);

        // @ts-ignore
        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) { // connect to game server.
            this.mConnection.startConnect(gateway);
        }
    }

    get game(): Phaser.Game {
        return this.mGame;
    }

    get connection(): ConnectionService {
        return this.mConnection;
    }

    private enterVirtualWorld() {
        let pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        let content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        content.virtualWorldUuid = this.mConfig.virtual_world_id;
        content.gameId = this.mConfig.game_id;
        content.userToken = this.mConfig.auth_token;
        content.expire = this.mConfig.token_expire;
        content.fingerprint = this.mConfig.token_fingerprint;
        this.mConnection.send(pkt);
    }

    onConnected(connection?: SocketConnection): void {
        console.info(`enterVirtualWorld`);
        this.enterVirtualWorld();
    }

    onDisConnected(connection?: SocketConnection): void {
    }

    onError(reason: SocketConnectionError | undefined): void {
    }

    private onInitVirtualWorldPlayerInit() {
        // start the game.
        this.mGame = new Game(this.mConfig);
    }
}
