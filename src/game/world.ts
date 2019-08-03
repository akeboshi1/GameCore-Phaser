import "phaser";
import {WorldService} from "./world.service";
import {PacketHandler} from "net-socket-packet";
import { Game } from "phaser";
import { IConnectListener, SocketConnection, SocketConnectionError } from "../net/socket";
import { IGameConfigure } from "../../launcher";
import { LayerManager } from "../layer/layer.manager";


// TODO 这里有个问题，需要先连socket获取游戏初始化的数据，所以World并不是Phaser.Game 而是驱动 Phaser.Game的驱动器
// TODO 让World成为一个以socket连接为基础的类，因为没有连接就不运行游戏
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService {
    private mConnection: SocketConnection;
    private mGame: Phaser.Game;
    private mConfig: IGameConfigure;
    private mLayerManager: LayerManager;

    constructor(config: IGameConfigure) {
        super();
        this.mConfig = config;
        this.mConnection = new SocketConnection(this);
        this.mConnection.addPacketListener(this);
        if (this.mConfig.sever_addr) {
            this.mConnection.startConnect(this.mConfig.sever_addr);
        }
        this.mGame = new Game(config);
    }

    getConnection(): SocketConnection {
        return undefined;
    }

    onConnected(connection: SocketConnection): void {
    }

    onDisConnected(connection: SocketConnection): void {
    }

    onError(reason: SocketConnectionError | undefined): void {
    }

    get game(): Phaser.Game {
        return this.mGame || new Game(this.mConfig);
    }

    get layerManager(): LayerManager {
        return this.mLayerManager;
    }
}
