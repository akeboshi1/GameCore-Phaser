import { op_client } from "pixelpai_proto";
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
    protected mRooms: IRoomService[];
    protected mCurRoom: IRoomService;
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
    protected onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE): void;
    private hasRoom;
    private onEnterScene;
    private onEnterEditor;
    private leaveRoom;
    private onEnterSceneHandler;
    get game(): Game;
    get currentRoom(): IRoomService;
    get connection(): ConnectionService;
}
