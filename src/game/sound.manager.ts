import { Logger } from "../utils/log";

export class SoundManager {
    private mScene: Phaser.Scene;
    private mBackground: Phaser.Sound.BaseSound;
    private mEffect: Phaser.Sound.BaseSound;
    constructor() {
        this.mBackground.play()
    }

    playBackground(key: string) {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist. play ${key} fatal`);
            return;
        }
        if (!this.mBackground) {
            this.mBackground = this.mScene.sound.add(key);
        }
        this.mBackground.play();
    }

    playEffect(key: string, market: string) {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist. play ${key} fatal`);
            return;
        }
        if (!this.mEffect) {
            // this.mEffect = this.mScene.sound.add();
        }
    }

    setScene(scene: Phaser.Scene) {
        this.mScene = scene;
    }
}