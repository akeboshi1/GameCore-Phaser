import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaExploreList extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryExploreChapter(chapterId: number): void;
    query_ENTER_ROOM(roomId: string, password?: string): void;
    private onQUERY_CHAPTER_RESULT;
}
