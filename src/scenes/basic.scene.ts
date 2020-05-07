export class BasicScene extends Phaser.Scene {
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    setViewPort(x: number, y: number, width: number, height: number) {
        this.cameras.main.setViewport(x, y, width, height);
    }
}
