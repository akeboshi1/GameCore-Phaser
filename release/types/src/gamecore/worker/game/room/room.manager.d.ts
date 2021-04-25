import { IRoomService } from "./room";
import { PacketHandler } from "net-socket-packet";
import { Game } from "../game";
import { ConnectionService } from "structure";
export interface IRoomManager {
    readonly game: Game | undefined;
    readonly currentRoom: IRoomService | undefined;
    readonly connection: ConnectionService | undefined;
    removeAllRoom(): any;
    addPackListener(): any;
    removePackListener(): any;
}
export declare class RoomManager extends PacketHandler implements IRoomManager {
    protected mGame: Game;
    private mRooms;
    private mCurRoom;
    constructor(game: Game);
    update(time: number, delay: number): void;
    addPackListener(): void;
    removePackListener(): void;
    getRoom(id: number): IRoomService | undefined;
    onFocus(): void;
    onBlur(): void;
    stop(): void;
    removeAllRoom(): void;
    destroy(): void;
    private hasRoom;
    private onEnterScene;
    private onEnterRoom;
    private onEnterEditor;
    private leaveRoom;
    private onEnterSceneHandler;
    get game(): Game;
    get currentRoom(): IRoomService;
    get connection(): ConnectionService;
}
