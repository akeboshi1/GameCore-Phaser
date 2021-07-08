import { SoundField } from "apowophaserui";
import { Logger } from "structure";
var SoundManager = /** @class */ (function () {
    function SoundManager(render) {
        this.render = render;
    }
    SoundManager.prototype.setScene = function (scene) {
        if (this.mSoundMap) {
            this.mSoundMap.clear();
        }
        this.mSoundMap = new Map();
        this.mScene = scene;
    };
    SoundManager.prototype.stopAll = function () {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist,can't stopAll");
            return;
        }
        this.mSoundMap.forEach(function (sound) { if (sound)
            sound.stop(); });
    };
    SoundManager.prototype.pauseAll = function () {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist,can't pauseAll");
            return;
        }
        this.mSoundMap.forEach(function (sound) { if (sound)
            sound.pause(); });
    };
    SoundManager.prototype.resume = function () {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist,can't resumeAll");
            return;
        }
        this.mSoundMap.forEach(function (sound) { if (sound)
            sound.resume(); });
    };
    SoundManager.prototype.destroy = function () {
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
    };
    SoundManager.prototype.playOsdSound = function (content) {
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
    };
    SoundManager.prototype.playSound = function (content) {
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
    };
    SoundManager.prototype.play = function (config) {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist. play " + config.key + " fatal");
            return;
        }
        var key = config.key;
        if (!key) {
            if (Array.isArray(config.urls)) {
                key = config.urls.join("");
            }
            else {
                key = config.urls;
            }
        }
        var field = config.field || SoundField.Background;
        var sound = this.mSoundMap.get(field);
        if (!sound) {
            sound = new Sound(this.mScene);
            this.mSoundMap.set(field, sound);
        }
        // sound.play(key);
        sound.play(key, config.urls, config.soundConfig);
    };
    SoundManager.prototype.stop = function (field) {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist,can't stop");
            return;
        }
        var sound = this.mSoundMap.get(field);
        if (!sound) {
            return;
        }
        sound.stop();
    };
    SoundManager.prototype.pause = function (field) {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist,can't pause");
            return;
        }
        var sound = this.mSoundMap.get(field);
        if (!sound) {
            return;
        }
        sound.pause();
    };
    SoundManager.prototype.resumes = function (field) {
        if (!this.mScene) {
            Logger.getInstance().fatal(SoundManager.name + " scene does not exist,can't resume");
            return;
        }
        var sound = this.mSoundMap.get(field);
        if (!sound) {
            return;
        }
        sound.resume();
    };
    return SoundManager;
}());
export { SoundManager };
var Sound = /** @class */ (function () {
    function Sound(scene) {
        this.scene = scene;
    }
    Sound.prototype.sound = function () {
        return this.mSound;
    };
    Sound.prototype.play = function (key, urls, soundConfig) {
        if (!this.scene) {
            return;
        }
        if (this.mSound && this.mSound.key === key) {
            if (this.mSound.isPlaying)
                return;
            this.mSound.play();
            return;
        }
        this.mKey = key;
        if (this.scene.cache.audio.exists(key)) {
            this.startPlay();
        }
        else {
            if (!urls) {
                return;
            }
            this.scene.load.once("filecomplete-audio-" + key, this.onSoundCompleteHandler, this);
            this.scene.load.audio(key, urls);
            this.scene.load.start();
        }
    };
    Sound.prototype.pause = function () {
        if (!this.scene) {
            return;
        }
        if (this.mSound) {
            if (this.mSound.isPaused)
                return;
            this.mSound.pause();
            return;
        }
    };
    Sound.prototype.stop = function () {
        if (!this.scene) {
            return;
        }
        if (this.mSound) {
            if (!this.mSound.isPlaying)
                return;
            this.mSound.stop();
            return;
        }
    };
    Sound.prototype.resume = function () {
        if (!this.scene) {
            return;
        }
        if (this.mSound) {
            if (!this.mSound.isPaused)
                return;
            this.mSound.resume();
            return;
        }
    };
    Sound.prototype.destroy = function () {
        if (this.mSound) {
            this.mSound.stop();
            this.mSound.destroy();
            this.mSound = undefined;
        }
    };
    Sound.prototype.onSoundCompleteHandler = function () {
        this.startPlay();
    };
    Sound.prototype.startPlay = function () {
        if (this.mSound) {
            this.mSound.stop();
            this.mSound.destroy();
        }
        this.mSound = this.scene.sound.add(this.mKey);
        this.mSound.play();
    };
    return Sound;
}());
//# sourceMappingURL=sound.manager.js.map