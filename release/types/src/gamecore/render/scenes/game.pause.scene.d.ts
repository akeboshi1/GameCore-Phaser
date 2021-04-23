import { BasicScene } from "baseRender";
export declare class GamePauseScene extends BasicScene {
    private bg;
    private pauseImg;
    private tipTF;
    constructor();
    preload(): void;
    create(): void;
    awake(): void;
    sleep(): void;
    getKey(): string;
    private downHandler;
    private checkSize;
}
