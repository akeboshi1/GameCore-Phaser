import { BasicScene } from "baseRender";
import { Size, SceneName } from "structure";

export class GamePauseScene extends BasicScene {
    protected bg: Phaser.GameObjects.Graphics;
    // private pauseImg: Phaser.GameObjects.Image;
    protected tipTF: Phaser.GameObjects.Text;
    constructor() {
        super({ key: SceneName.GAMEPAUSE_SCENE });
    }
    public preload() {
       // this.load.image("gamepause.png", Url.getRes("gamepause.png"));
    }

    public create() {
        super.create();
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        this.bg = this.add.graphics();
        this.bg.fillStyle(0, .8);
        this.bg.fillRect(0, 0, width, height);
        // this.pauseImg = this.add.image(width >> 1, height >> 1, "gamepause.png");
        this.tipTF = this.add.text(width - 240 >> 1, height - 50, "点击任意位置开始游戏", { font: "30px Tahoma" });
        this.scale.on("resize", this.checkSize, this);
        this.checkSize(new Size(width, height));
        this.input.on("pointerdown", this.downHandler, this);
    }

    public awake() {
        this.scale.on("resize", this.checkSize, this);
        this.input.on("pointerdown", this.downHandler, this);
        this.scene.wake();
    }

    public sleep() {
        this.scale.off("resize", this.checkSize, this);
        this.input.off("pointerdown", this.downHandler, this);
        this.scene.sleep();
    }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }

    private downHandler() {
        this.render.onFocus();
    }

    private checkSize(size: Size) {
        const width: number = size.width;
        const height: number = size.height;
        this.bg.clear();
        this.bg.fillStyle(0, .8);
        this.bg.fillRect(0, 0, width, height);
        // this.pauseImg.scaleX = this.pauseImg.scaleY = this.render.uiScale * .7;
        // this.pauseImg.x = width >> 1;
        // this.pauseImg.y = height >> 1;
        this.tipTF.scaleX = this.tipTF.scaleY = this.render.uiScale;
        this.tipTF.x = width - 280 * this.render.uiScale >> 1;
        this.tipTF.y = height - 50 * this.render.uiScale;
    }

}
