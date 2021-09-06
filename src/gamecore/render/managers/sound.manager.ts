import { SoundField } from "apowophaserui";
import { Render } from "../render";
import { Logger } from "structure";

export class SoundManager {

    protected mScene: Phaser.Scene;
    protected mSoundMap: Map<SoundField, Sound>;
    constructor(protected render: Render) {
    }

    setScene(scene: Phaser.Scene) {
        if (this.mSoundMap) {
            this.mSoundMap.clear();
        }
        this.mSoundMap = new Map();
        this.mScene = scene;
    }

    stopAll() {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't stopAll`);
            return;
        }
        this.mSoundMap.forEach((sound) => { if (sound) sound.stop(); });
    }

    pauseAll() {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't pauseAll`);
            return;
        }
        this.mSoundMap.forEach((sound) => { if (sound) sound.pause(); });
    }

    resume() {
        if (!this.mScene) {

            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't resumeAll`);
            return;
        }
        this.mSoundMap.forEach((sound) => { if (sound) sound.resume(); });
    }

    destroy() {
        // phaser 内部会做统一处理，不需要手动清除sound
        // if (this.mSoundMap) {
        //     this.mSoundMap.forEach((sound) => {
        //         if (sound) {
        //             sound.stop();
        //             sound.destroy();
        //         }
        //     });
        //     this.mSoundMap.clear();
        //     this.mSoundMap = undefined;
        // }
    }

    public playOsdSound(content: any) {
        // const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL = packet.content;
        if (content.loop === undefined) {
            content.loop = false;
        }
        // TODO
        this.play({
            key: content.soundKey,
            urls: this.render.url.getOsdRes(content.soundKey),
            field: content.scope,
            soundConfig: { loop: content.loop }
        });
    }
    public playSound(content: any) {
        // const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL = packet.content;
        if (content.loop === undefined) {
            content.loop = false;
        }
        // TODO
        this.play({
            key: content.soundKey,
            urls: this.render.url.getRes(content.soundKey),
            field: content.scope,
            soundConfig: { loop: content.loop }
        });
    }
    protected play(config: any) {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist. play ${config.key} fatal`);
            return;
        }
        let key = config.key;
        if (!key) {
            if (Array.isArray(config.urls)) {
                key = config.urls.join("");
            } else {
                key = config.urls;
            }
        }
        const field = config.field || SoundField.Background;
        let sound = this.mSoundMap.get(field);
        if (!sound) {
            sound = new Sound(this.mScene);
            this.mSoundMap.set(field, sound);
        }
        // sound.play(key);
        sound.play(key, config.urls, config.soundConfig);
    }

    protected stop(field: SoundField) {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't stop`);
            return;
        }
        const sound = this.mSoundMap.get(field);
        if (!sound) {
            return;
        }
        sound.stop();
    }

    protected pause(field: SoundField) {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't pause`);
            return;
        }
        const sound = this.mSoundMap.get(field);
        if (!sound) {
            return;
        }
        sound.pause();
    }

    protected resumes(field: SoundField) {
        if (!this.mScene) {
            Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't resume`);
            return;
        }
        const sound = this.mSoundMap.get(field);
        if (!sound) {
            return;
        }
        sound.resume();
    }
}

export class Sound {
    private mKey: string;
    private mSound: Phaser.Sound.BaseSound;
    private soundConfig: Phaser.Types.Sound.SoundConfig;
    constructor(private scene: Phaser.Scene) {
    }
    sound(): Phaser.Sound.BaseSound {
        return this.mSound;
    }

    play(key: string, urls?: string | string[], soundConfig?: Phaser.Types.Sound.SoundConfig) {
        if (!this.scene) {
            return;
        }
        this.soundConfig = this.soundConfig || soundConfig;
        if (this.mSound && this.mSound.key === key) {
            if (this.mSound.isPlaying) return;
            this.mSound.play(this.soundConfig);
            return;
        }
        this.mKey = key;
        if (this.scene.cache.audio.exists(key)) {
            this.startPlay();
        } else {
            if (!urls) {
                return;
            }
            this.scene.load.once(`filecomplete-audio-${key}`, this.onSoundCompleteHandler, this);
            this.scene.load.audio(key, urls);
            this.scene.load.start();
        }
    }

    pause() {
        if (!this.scene) {
            return;
        }
        if (this.mSound) {
            if (this.mSound.isPaused) return;
            this.mSound.pause();
            return;
        }
    }

    stop() {
        if (!this.scene) {
            return;
        }
        if (this.mSound) {
            if (!this.mSound.isPlaying) return;
            this.mSound.stop();
            return;
        }
    }

    resume() {
        if (!this.scene) {
            return;
        }
        if (this.mSound) {
            if (!this.mSound.isPaused) return;
            this.mSound.resume();
            return;
        }
    }

    destroy() {
        if (this.mSound) {
            this.mSound.stop();
            this.mSound.destroy();
            this.mSound = undefined;
        }
    }

    protected onSoundCompleteHandler() {
        this.startPlay();
    }

    protected startPlay() {
        if (this.mSound) {
            this.mSound.stop();
            this.mSound.destroy();
        }
        this.mSound = this.scene.sound.add(this.mKey);
        this.mSound.play(this.soundConfig);
    }
}
