export class BasicScene extends Phaser.Scene {
    protected mInitialize: boolean = false;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    public create() {
        this.mInitialize = true;
    }

    public sceneInitialize(): boolean {
        return this.mInitialize;
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
