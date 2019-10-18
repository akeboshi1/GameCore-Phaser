import { WorldService } from "../game/world.service";
import { Url } from "../utils/resUtil";

export class GamePauseScene extends Phaser.Scene {
    private mWorld: WorldService;
    constructor() {
        super({ key: GamePauseScene.name });
    }
    public preload() {
        this.load.image("gamepause.png", Url.getRes("gamepause.png"));
    }

    public init(data: any) {
        this.mWorld = data.world;
    }

    public create() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        const rect = this.add.graphics();
        rect.fillStyle(0, .8);
        rect.fillRect(0, 0, width, height);
        const pauseImg: Phaser.GameObjects.Image = this.add.image(width >> 1, height >> 1, "gamepause.png");
        pauseImg.scaleX = pauseImg.scaleY = this.mWorld.uiScale / 2;
        const tipTF: Phaser.GameObjects.Text = this.add.text(width - 240 >> 1, height - 50, "点击任意位置开始游戏", { font: "30px Tahoma" });
        this.scale.lockOrientation("landscape");
        // tipTF.setFontFamily("Tahoma");
        // tipTF.setFontSize(15);
    }

    public awake() {
        this.scene.wake();
    }

    public sleep() {
        this.scene.sleep();
    }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }
}
