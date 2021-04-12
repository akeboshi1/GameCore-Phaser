import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaHouse extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryRoomInfo(roomid: any): void;
    query_REFURBISH_REQUIREMENTS(roomid: any): void;
    query_ROOM_REFURBISH(roomid: any): void;
    private onRetRoomInfoHandler;
    private on_REFURBISH_REQUIREMENTS;
}
