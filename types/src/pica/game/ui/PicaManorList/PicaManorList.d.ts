import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaManorList extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_COMMERCIAL_STREET(page: number, per_page: number): void;
    queryEnterRoom(roomID: string, password?: string): void;
    private onCOMMERCIAL_STREET;
}
