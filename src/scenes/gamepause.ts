import { WorldService } from "../game/world.service";
import { Url } from "../utils/resUtil";
import { Size } from "../utils/size";

export class GamePauseScene extends Phaser.Scene {
    private mWorld: WorldService;
    private bg: Phaser.GameObjects.Graphics;
    private pauseImg: Phaser.GameObjects.Image;
    private tipTF: Phaser.GameObjects.Text;
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
        this.bg = this.add.graphics();
        this.bg.fillStyle(0, .8);
        this.bg.fillRect(0, 0, width, height);
        this.pauseImg = this.add.image(width >> 1, height >> 1, "gamepause.png");
        this.pauseImg.scaleX = this.pauseImg.scaleY = this.mWorld.uiScale;
        this.tipTF = this.add.text(width - 240 >> 1, height - 50, "点击任意位置开始游戏", { font: "30px Tahoma" });
        this.scale.on("orientationchange", this.checkOriention, this);
        this.scale.on("resize", this.checkSize, this);
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

    private checkOriention(orientation) {
        if (orientation === Phaser.Scale.PORTRAIT) {

        } else if (orientation === Phaser.Scale.LANDSCAPE) {

        }
    }

    private checkSize(size: Size) {
        const width: number = size.width;
        const height: number = size.height;
        this.bg.clear();
        this.bg.fillStyle(0, .8);
        this.bg.fillRect(0, 0, width, height);
        this.pauseImg.x = width >> 1;
        this.pauseImg.y = height >> 1;
        this.tipTF.x = width - 240 >> 1;
        this.tipTF.y = height - 50;
    }

}
