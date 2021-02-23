export class PicaLevelUpEffectPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private lightSprite: Phaser.GameObjects.Sprite;
    private yuSprite: Phaser.GameObjects.Sprite;
    private wingSprite: Phaser.GameObjects.Sprite;
    private levelbg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    private tipTex: Phaser.GameObjects.Text;
    private tipCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }

    protected init() {
       // this.lightSprite = this.createSprite();
        this.tipCon = this.scene.make.container(undefined, false);
    }
    private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0) {
        const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
        this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        return sprite;
    }
}
