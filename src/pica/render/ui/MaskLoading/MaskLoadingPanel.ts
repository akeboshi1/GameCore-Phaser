import { BasePanel, MainUIScene, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";

export class MaskLoadingPanel extends BasePanel {
    private maskGrap: Phaser.GameObjects.Graphics;
    private ani: Phaser.GameObjects.Sprite;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.MASK_LOADING_NAME;
    }

    resize() {
        const { width, height } = this.scene.cameras.main;
        this.maskGrap.fillRect(0, 0, width, height);
        const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
        if (this.maskGrap.input) {
            this.maskGrap.input.hitArea = hitArea;
        } else {
            this.maskGrap.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        }
    }

    protected init() {
        const { width, height } = this.scene.cameras.main;
        this.maskGrap = this.scene.make.graphics(undefined, false);
        this.maskGrap.fillStyle(0, 0.4);

        const aniName = `${this.key}_ani`;
        this.scene.anims.create({
            key: aniName,
            frames: this.scene.anims.generateFrameNames(this.key, { prefix: "", start: 1, end: 22, zeroPad: 2, suffix: ".png" }),
            frameRate: 12,
            repeat: -1
          });

        this.ani = this.scene.make.sprite({ key: this.key });
        this.ani.x = width / this.scale * 0.5;
        this.ani.y = height / this.scale * 0.5;
        this.ani.play(aniName);
        this.add([this.maskGrap, this.ani]);
        super.init();
        (<MainUIScene>this.mScene).layerManager.addToLayer(MainUIScene.LAYER_MASK, this);

        this.resize();
    }

    protected __exportProperty() {
    }
}
