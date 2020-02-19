import { ResUtils, Url } from "../../utils/resUtil";

export class FallEffect extends Phaser.GameObjects.Container {
    private mDisplay: Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene) {
        super(scene);

        if (this.scene.textures.exists("fall_effect")) {
            this.onCompleteHandler();
        } else {
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
            this.scene.load.atlas("fall_effect", Url.getRes("ui/fall_effect/falleffect.png"), Url.getRes("ui/fall_effect/falleffect.json"));
            this.scene.load.start();
        }
    }

    private onCompleteHandler() {
        this.mDisplay = this.scene.make.sprite({
            key: "fall_effect",
            frame: "mouse_1.png",
            x: 25,
            y: -25
        }, false);
        this.add(this.mDisplay);

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
