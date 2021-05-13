import { StringUtils } from "utils";
import { LayerManager } from "../layer";
export class BasicScene extends Phaser.Scene {
    public layerManager: LayerManager;
    protected initialize: boolean = false;
    protected hasChangeScene: boolean = false;
    protected hasDestroy: boolean = false;
    protected render: any;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.layerManager = new LayerManager();
    }

    public init(data: any) {
        if (data) {
            this.render = data.render;
        }
    }

    public preload() {
        const str = StringUtils.format("正在加载资源 {0}", ["0%"]);
        if (this.render) this.render.showLoading({ "text": str });
    }

    setScale(zoom: number) {
        if (this.layerManager) this.layerManager.setScale(zoom);
    }

    public updateProgress(data: any) {
    }

    public loadProgress(data: any) {
    }

    public create() {
        this.initialize = true;
        this.render.emitter.emit("sceneCreated");
        this.events.on("shutdown", this.destroy, this);
    }

    public destroy() {
        this.events.off("shutdown", this.destroy, this);
        this.hasDestroy = true;
        this.initialize = false;
        this.hasChangeScene = false;
    }

    public sceneInitialize(): boolean {
        return this.initialize;
    }

    public sceneDestroy(): boolean {
        return this.hasDestroy;
    }

    public get sceneChange(): boolean {
        return this.hasChangeScene;
    }

    public set sceneChange(boo: boolean) {
        this.hasChangeScene = boo;
    }

    public setViewPort(x: number, y: number, width: number, height: number) {
        this.cameras.main.setViewport(x, y, width, height);
    }

    public wake(data?: any) {
        this.scene.wake(undefined, data);
    }

    public sleep() {
        this.scene.sleep();
    }

    public stop() {
        this.scene.stop();
    }
}
