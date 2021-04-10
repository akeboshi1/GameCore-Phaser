import { LayerManager } from "baseRender";
import { Render } from "../../../render/render";
export declare class BasicScene extends Phaser.Scene {
    layerManager: LayerManager;
    protected initialize: boolean;
    protected render: Render;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig);
    init(data: any): void;
    preload(): void;
    setScale(zoom: number): void;
    updateProgress(data: any): void;
    loadProgress(data: any): void;
    create(): void;
    sceneInitialize(): boolean;
    setViewPort(x: number, y: number, width: number, height: number): void;
    wake(data?: any): void;
    sleep(): void;
    stop(): void;
}
