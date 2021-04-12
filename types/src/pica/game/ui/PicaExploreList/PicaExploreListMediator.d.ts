import { BasicMediator } from "gamecore";
import { PicaExploreList } from "./PicaExploreList";
import { PicaGame } from "picaWorker";
export declare class PicaExploreListMediator extends BasicMediator {
    protected mModel: PicaExploreList;
    protected game: PicaGame;
    constructor(game: PicaGame);
    show(param?: any): void;
    hide(): void;
    protected panelInit(): void;
    get playerInfo(): any;
    private onHidePanel;
    private onQUERY_CHAPTER_RESULT;
    private onChapterResultHandler;
    private onEnterRoomHandler;
    private setChapters;
}
