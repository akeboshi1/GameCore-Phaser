const LOGO_MARGIN = 25;

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({key: LoadingScene.name});
    }

    public preload() {
        this.load.spritesheet("rabbit00.png", "/resources/rabbit00.png", {frameWidth: 150, frameHeight: 150});
    }

    public create() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        const rect = this.add.graphics();
        rect.fillStyle(0x616161);
        rect.fillRect(0, 0, width, height);
        this.anims.create({
            key: "loading_rabbit00",
            frames: this.anims.generateFrameNumbers("rabbit00.png", {start: 0, end: 59}),
            frameRate: 33,
            yoyo: true,
            repeat: -1
        });
        const x: number = width - 150 - LOGO_MARGIN;
        const y: number = height - 150 - LOGO_MARGIN;
        const lo = this.add.sprite(x, y, "rabbit00.png");
        lo.anims.play("loading_rabbit00");
    }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }
}
