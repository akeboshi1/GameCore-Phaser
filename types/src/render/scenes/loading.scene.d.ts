import { BasicScene } from "baseRender";
export declare class LoadingScene extends BasicScene {
    private bg;
    private mask;
    private debug;
    private mCallback;
    private curtain;
    private progressText;
    private tipsText;
    private dpr;
    private progressData;
    private mRequestCom;
    private mTxtList;
    constructor();
    preload(): void;
    init(data: any): void;
    create(): void;
    getProgress(): string;
    updateProgress(text: any): void;
    loadProgress(text: any): void;
    wake(data?: any): void;
    sleep(): void;
    appendProgress(text: string): void;
    getKey(): string;
    private getDebug;
    private displayVisible;
    private createFont;
}
