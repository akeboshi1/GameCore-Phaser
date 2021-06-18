/// <reference types="tooqingphaser" />
import { BasicScene } from "baseRender";
export declare class GamePauseScene extends BasicScene {
    protected bg: Phaser.GameObjects.Graphics;
    protected tipTF: Phaser.GameObjects.Text;
    constructor();
    preload(): void;
    create(): void;
    awake(): void;
    sleep(): void;
    getKey(): string;
    private downHandler;
    private checkSize;
}
