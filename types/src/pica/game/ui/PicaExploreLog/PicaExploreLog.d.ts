import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaExploreLog extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryExploreChapter(chapterId: number): void;
    queryExploreUseHint(): void;
    queryGOHome(): void;
    private onEXPLORE_REQUIRE_LIST;
    private onQUERY_CHAPTER_RESULT;
    private onEXPLORE_SUMMARY;
    private onSHOW_COUNTDOWN;
    private onSHOW_GUIDE_TEXT;
}
