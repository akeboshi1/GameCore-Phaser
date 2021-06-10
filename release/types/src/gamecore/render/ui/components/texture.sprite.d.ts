/// <reference types="tooqinggamephaser" />
import { Handler } from "structure";
export declare class TextureSprite extends Phaser.GameObjects.Container {
    private compl;
    private error;
    private mUrls;
    private loadUrls;
    private errorUrls;
    private dpr;
    private auto;
    private times;
    private timeFrame;
    private tempTimes;
    private timerID;
    private isPlaying;
    private indexed;
    private frameImg;
    constructor(scene: any, dpr: number, auto?: boolean, timeFrame?: number, times?: number);
    load(value: string[], compl?: Handler, error?: Handler): void;
    setAniData(times?: number, timeFrame?: number): void;
    play(force?: boolean): void;
    stop(): void;
    destroy(fromScene?: boolean): void;
    get playing(): boolean;
    protected playEnd(): void;
    protected onLoadComplete(file?: string): void;
    protected onLoadError(file: Phaser.Loader.File): void;
}
