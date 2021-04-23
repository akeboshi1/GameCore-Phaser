/// <reference types="tooqinggamephaser" />
import { SoundField } from "apowophaserui";
import { Render } from "../render";
export declare class SoundManager {
    protected render: Render;
    private mScene;
    private mSoundMap;
    constructor(render: Render);
    setScene(scene: Phaser.Scene): void;
    stopAll(): void;
    pauseAll(): void;
    resume(): void;
    destroy(): void;
    playOsdSound(content: any): void;
    playSound(content: any): void;
    protected play(config: any): void;
    protected stop(field: SoundField): void;
    protected pause(field: SoundField): void;
    protected resumes(field: SoundField): void;
}
