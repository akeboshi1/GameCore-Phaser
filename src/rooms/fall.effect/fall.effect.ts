import { ResUtils, Url } from "../../utils/resUtil";

export class FallEffect extends Phaser.GameObjects.Container {
    private mDisplay: Phaser.GameObjects.Sprite;
    private mEnable: boolean;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public show(enable: boolean) {
        this.mEnable = enable;
        this.load();
    }

    private load() {
        if (this.scene.textures.exists("fall_effect")) {
            this.onCompleteHandler();
        } else {
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
            this.scene.load.atlas("fall_effect", Url.getRes("ui/fall_effect/falleffect.png"), Url.getRes("ui/fall_effect/falleffect.json"));
            this.scene.load.start();
        }
    }

    private showEnable() {
        const config = {
            key: "fill_effect_enable",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "enable", end: 6, zeroPad: 2 }),
            frameRate: 8,
            repeat: 0
        };
        this.mDisplay.setPosition(25, -25);

        this.scene.anims.create(config);
        this.mDisplay.play("fill_effect_enable");
    }

    private showDisable() {
        this.mDisplay.setFrame("forbid");
    }

    private onCompleteHandler() {
        this.mDisplay = this.scene.make.sprite({
            key: "fall_effect",
        }, false);
        this.add(this.mDisplay);

        if (this.mEnable) {
            this.showEnable();
        } else {
            this.showDisable();
        }
        // if (this.mType === FallType.Enable) {
        //     this.createEnable();
        // } else {
        //     this.createDisable();
        // }

        this.scene.tweens.add({
            targets: this,
            duration: 2000,
            props: { alpha: 0 },
            onComplete: () => {
                this.destroy();
                this.emit("remove", this);
            }
        });
    }
}

enum FallType {
    Enable,
    Disable
}
