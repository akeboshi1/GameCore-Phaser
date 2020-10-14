export class BasicScene extends Phaser.Scene {
    protected mInitialize: boolean = false;
    protected mShow: boolean = false;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    public create() {
        this.mInitialize = true;
    }

    sceneInitialize(): boolean {
        return this.mInitialize;
    }

    getShow(): boolean {
        return this.mShow;
    }

    setViewPort(x: number, y: number, width: number, height: number) {
        this.cameras.main.setViewport(x, y, width, height);
    }
}
