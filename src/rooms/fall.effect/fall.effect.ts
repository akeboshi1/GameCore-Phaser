import { ResUtils, Url } from "../../utils/resUtil";

export class FallEffect extends Phaser.GameObjects.Container {
    private mDisplay: Phaser.GameObjects.Sprite | EnableDisplay;
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
        // const config = {
        //     key: "fill_effect_enable",
        //     frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "enable", end: 6, zeroPad: 2 }),
        //     frameRate: 8,
        //     repeat: 0
        // };
        // this.mDisplay.setPosition(25, -25);

        // this.scene.anims.create(config);
        // this.mDisplay.play("fill_effect_enable");
        this.mDisplay = new EnableDisplay(this.scene, "fall_effect");
        this.add(this.mDisplay);
    }

    private showDisable() {
        this.mDisplay = this.scene.make.sprite({
            key: "fall_effect",
            frame: "forbid"
        }, false);
        this.add(this.mDisplay);
    }

    private onCompleteHandler() {
        // this.mDisplay = this.scene.make.sprite({
        //     key: "fall_effect",
        // }, false);
        // this.add(this.mDisplay);

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
            duration: 1000,
            ease: "Expo",
            delay: 1000,
            props: { alpha: 0 },
            onComplete: () => {
                this.destroy();
                this.emit("remove", this);
            }
        });
    }
}

class EnableDisplay extends Phaser.GameObjects.Container {
    private mImage: Phaser.GameObjects.Sprite;
    private mEllipse: Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene, key: string) {
        super(scene);
        this.mImage = scene.make.sprite({
            key,
            x: 20,
            y: -30
        }, false);
        this.add(this.mImage);

        // const tween = this.scene.tweens.add({
        //     targets: this.mImage,
        //     duration: 1000,
        //     delay: 600,
        //     props: {
        //         alpha: 0.6
        //     },
        //     onComplete: () => {
        //         tween.destroy();
        //         this.mImage.destroy();
        //         this.mImage = undefined;
        //     }
        // })

        // this.mEllipse = scene.make.graphics(undefined, false);
        // this.mEllipse.fillStyle(0, 0.6);
        // this.mEllipse.fillEllipse(0, 0, 30, 15)
        this.mEllipse = scene.make.sprite(undefined, false);
        this.addAt(this.mEllipse, 0);

        const config = {
            key: "fill_effect_enable",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "enable", end: 6, zeroPad: 2 }),
            frameRate: 16,
            repeat: 0
        };
        this.scene.anims.create(config);
        this.mImage.play("fill_effect_enable");

        const ellipseConfig = {
            key: "fill_effect_ellipse",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "ellipse", end: 7, zeroPad: 2 }),
            frameRate: 10,
            repeat: 0
        };
        this.scene.anims.create(ellipseConfig);
        this.mEllipse.play("fill_effect_ellipse");
    }
}
