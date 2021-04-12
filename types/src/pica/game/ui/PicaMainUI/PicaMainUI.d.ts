import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaMainUI extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    query_PRAISE_ROOM(roomid: string, praise: boolean): void;
    fetchPlayerInfo(): void;
    private onUpdateModeRoomInfo;
    get connection(): ConnectionService;
}
