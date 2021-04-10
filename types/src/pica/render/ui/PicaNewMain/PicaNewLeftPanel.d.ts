import { Button } from "apowophaserui";
import { Handler } from "utils";
export declare class PicaNewLeftPanel extends Phaser.GameObjects.Container {
    taskButton: Button;
    mapButton: Button;
    private dpr;
    private key;
    private sendHandler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number);
    init(): void;
    updateUIState(datas: any): void;
    setHandler(send: Handler): void;
    private onMapButtonHandler;
    private onTaskButtonHandler;
    private getButton;
}
