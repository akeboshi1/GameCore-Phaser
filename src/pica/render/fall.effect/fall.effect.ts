import { op_def } from "pixelpai_proto";
import { Url } from "utils";

export class FallEffect extends Phaser.GameObjects.Container {
    private mDisplay: DisableDisplay | EnableDisplay;
    private mStatus: op_def.PathReachableStatus;
    private mEnable: boolean;
    constructor(scene: Phaser.Scene, scaleRatio: number) {
        super(scene);
        this.scale = scaleRatio;
    }

    public show(status: op_def.PathReachableStatus) {
        this.mStatus = status;
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
        // this.mDisplay = this.scene.make.sprite({
        //     key: "fall_effect",
        //     frame: "forbid"
        // }, false).setScale(0.5);
        this.mDisplay = new DisableDisplay(this.scene, "fall_effect");
        this.add(this.mDisplay);
    }

    private onCompleteHandler() {
        // this.mDisplay = this.scene.make.sprite({
        //     key: "fall_effect",
        // }, false);
        // this.add(this.mDisplay);

        if (this.mStatus === op_def.PathReachableStatus.PATH_REACHABLE_AREA || this.mStatus === op_def.PathReachableStatus.PATH_REACHABLE_WITH_INTERACTION_SPRITE) {
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
            delay: 300,
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
            x: 9,
            y: -20
        }, false).setScale(0.5);
        this.add(this.mImage);

        this.mEllipse = scene.make.sprite(undefined, false);
        this.addAt(this.mEllipse, 0);

        const config = {
            key: "fill_effect_enable",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "enable", end: 3, zeroPad: 2 }),
            frameRate: 10,
            repeat: 0
        };
        this.scene.anims.create(config);
        this.mImage.play("fill_effect_enable");

        const ellipseConfig = {
            key: "fill_effect_ellipse",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "ellipse", end: 7, zeroPad: 2 }),
            frameRate: 18,
            repeat: 0
        };
        this.scene.anims.create(ellipseConfig);
        this.mEllipse.play("fill_effect_ellipse");
    }
}

class DisableDisplay extends Phaser.GameObjects.Container {
    private mImage: Phaser.GameObjects.Image;
    private mEllipse: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string) {
        super(scene);
        this.mImage = scene.make.image({
            key,
            y: -6,
            frame: "disable",
        }, false).setScale(0.5);
        this.add(this.mImage);

        this.mEllipse = scene.make.image({
            key,
            frame: "forbid"
        }, false).setScale(0.5);

        this.add([this.mImage, this.mEllipse]);
    }
}
