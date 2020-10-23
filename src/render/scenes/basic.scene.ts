import { LayerManager } from "../managers/layer.manager";
import { Render } from "../render";

export class BasicScene extends Phaser.Scene {
    public layerManager: LayerManager;
    protected initialize: boolean = false;
    protected render: Render;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.layerManager = new LayerManager();
    }

    public init(data: any) {
        if (data) {
            this.render = data.render;
        }
    }

    setScale(zoom: number) {
        if (this.layerManager) this.layerManager.setScale(zoom);
    }

    public create() {
        this.initialize = true;
    }

    public sceneInitialize(): boolean {
        return this.initialize;
    }

    public setViewPort(x: number, y: number, width: number, height: number) {
        this.cameras.main.setViewport(x, y, width, height);
    }

    public wake(data?: any) {
        this.scene.wake();
    }

    public sleep() {
        this.scene.sleep();
    }
}
