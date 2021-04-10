import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaRoomList extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    sendGetRoomList(): void;
    sendMyHistory(): void;
    sendEnterRoom(roomID: string, password?: string): void;
    private onRoomListHandler;
    private onMyRoomListHandler;
    private onEnterRoomResultHandler;
    get connection(): ConnectionService;
}
