import { ButtonEventDispatcher } from "gamecoreRender";
import { Handler } from "utils";
import { op_client } from "pixelpai_proto";
export declare class PicaExploreListBottomPanel extends Phaser.GameObjects.Container {
    chapterItems: ChapterItemProgress[];
    private bg;
    private leftButton;
    private rightButton;
    private zoom;
    private dpr;
    private chapterProDatas;
    private curChapterID;
    private unlockChapterID;
    private send;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(w: number, h: number): void;
    refreshMask(): void;
    setChapterDatas(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS): void;
    setHandler(send: Handler): void;
    setChapterProData(): void;
    protected init(): void;
    protected createChapterItems(): void;
    private onLeftClickHandler;
    private onRightClickHandler;
    private onChapterProHandler;
}
declare class ChapterItemProgress extends ButtonEventDispatcher {
    dpr: number;
    private zoom;
    private bg;
    private lightbg;
    private topbg;
    private levelTex;
    private barmask;
    private finishImg;
    private lockImg;
    private chapterProData;
    private send;
    private proValue;
    private isZoom;
    private unlock;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number, isZoom?: boolean);
    /**
     *
     * progress [-1,0,100] -1 为未解锁,进度最大值为100
     */
    setChapterData(data: op_client.IPKT_EXPLORE_CHAPTER_PROGRESS): void;
    setProgress(value: number): void;
    refreshMask(): void;
    destroy(): void;
    setZoom(zoom: boolean): void;
    setHandler(send: Handler): void;
    protected init(): void;
    private onClickHandler;
}
export {};
