import { LayerManager } from "../layer";
export declare class BasicScene extends Phaser.Scene {
    layerManager: LayerManager;
    protected initialize: boolean;
    protected hasChangeScene: boolean;
    protected hasDestroy: boolean;
    protected render: any;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig);
    init(data: any): void;
    preload(): void;
    setScale(zoom: number): void;
    updateProgress(data: any): void;
    loadProgress(data: any): void;
    create(): void;
    destroy(): void;
    sceneInitialize(): boolean;
    sceneDestroy(): boolean;
    get sceneChange(): boolean;
    set sceneChange(boo: boolean);
    setViewPort(x: number, y: number, width: number, height: number): void;
    wake(data?: any): void;
    sleep(): void;
    stop(): void;
}
