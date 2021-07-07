import { op_client } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { IRoomService } from "./room";
import { ConnectionService } from "structure";
import { Capsule } from "game-capsule";
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
    protected remoteIndex: number;
    constructor(game: Game);
    update(time: number, delay: number): void;
    addPackListener(): void;
    removePackListener(): void;
    getRoom(id: number): IRoomService | undefined;
    onFocus(): void;
    onBlur(): void;
    stop(): void;
    removeAllRoom(): void;
    hasRoom(id: number): boolean;
    leaveRoom(room: IRoomService): Promise<void>;
    onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE): void;
    destroy(): void;
    loadGameConfig(remotePath: any): Promise<Capsule>;
    decodeConfigs(req: any): Promise<Capsule>;
    protected onEnterSceneHandler(packet: PBpacket): void;
    protected onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE): Promise<void>;
    protected loadSceneConfig(sceneID: string): Promise<any>;
    protected getConfigUrl(sceneId: string): string;
    private onEnterEditor;
    private onEnterResult;
    get game(): Game;
    get currentRoom(): IRoomService;
    get connection(): ConnectionService;
}
