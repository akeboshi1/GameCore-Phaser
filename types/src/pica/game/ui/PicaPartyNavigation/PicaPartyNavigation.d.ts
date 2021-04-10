import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaPartyNavigation extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_PARTY_LIST(): void;
    queryEnterRoom(roomID: string, password?: string): void;
    query_PLAYER_PROGRESS(name: string): void;
    query_PLAYER_PROGRESS_REWARD(index: number): void;
    query_GET_ROOM_LIST(page: number, perPage: number): void;
    query_ROOM_HISTORY(): void;
    query_ROOM_LIST(roomType: number, page?: number, perPage?: number): void;
    query_SELF_ROOM_LIST(roomType: number): void;
    private on_PARTY_LIST;
    private on_PLAYER_PROGRESS;
    private onRoomListHandler;
    private onMyRoomListHandler;
    private onEnterRoomResultHandler;
    private onNewRoomListHandler;
    private onNewSelfRoomListHandler;
}
