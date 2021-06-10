import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { IState } from "structure";
import { Game } from "../game";
import { MainPeer } from "../main.peer";
export class BaseState extends PacketHandler implements IState {
    protected mMain: MainPeer;
    protected mKey: string;
    protected mConnect: ConnectionService;
    protected mGame: Game;
    constructor(main: MainPeer, key: string) {
        super();
        this.mMain = main;
        this.mKey = key;
    }
    get main(): MainPeer {
        return this.mMain;
    }
    get key(): string {
        return this.mKey;
    }
    run(data?: any) {
        this.mConnect = this.mMain.game.connection;
        this.mGame = this.mMain.game;
    }
    update(data?: any) {
    }
    next(data?: any) {
        this.removePacketListener();
    }
    addPacketListener() {
        if (this.mConnect) this.mConnect.addPacketListener(this);
    }

    removePacketListener() {
        if (this.mConnect) this.mConnect.removePacketListener(this);
    }
}
