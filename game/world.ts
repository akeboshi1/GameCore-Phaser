import "phaser";
import {IWorldService} from "./world-service";
import {IConnectListener, SocketConnection, SocketConnectionError} from "../net/socket";
import {ServerAddress} from "../net/address";
import {IGameConfigure} from "../launcher";
import {PacketHandler} from "net-socket-packet";


// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, IWorldService {
    private mConnection: SocketConnection;
    private mGame: Phaser.Game;
    private mConfig: IGameConfigure;

    constructor(config: IGameConfigure) {
        super();
        this.mConfig = config;
        this.mConnection = new SocketConnection(this);
        this.mConnection.addPacketListener(this);
        this.mConnection.startConnect(this.mConfig.sever_addr);
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
}
