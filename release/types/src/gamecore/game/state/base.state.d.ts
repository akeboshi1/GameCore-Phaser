import { PacketHandler } from "net-socket-packet";
import { ConnectionService, IState } from "structure";
import { Game } from "../game";
import { MainPeer } from "../main.peer";
export declare class BaseState extends PacketHandler implements IState {
    protected mMain: MainPeer;
    protected mKey: string;
    protected mConnect: ConnectionService;
    protected mGame: Game;
    constructor(main: MainPeer, key: string);
    get main(): MainPeer;
    get key(): string;
    run(data?: any): void;
    update(data?: any): void;
    next(data?: any): void;
    addPacketListener(): void;
    removePacketListener(): void;
}
