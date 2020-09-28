import { IRoomService } from "../rooms/room";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { WorldService } from "../world.service";
import { Logger } from "../../../utils/log";
import { Url } from "../../../utils/resUtil";

export enum SoundField {
    Background,
    Element,
    Effect
}

export interface ISoundConfig {
    key?: string;
    urls?: string | string[];
    field?: SoundField;
    soundConfig?: Phaser.Types.Sound.SoundConfig;
}

export class SoundManager extends PacketHandler {
    private readonly world: WorldService;
    private mScene: Phaser.Scene;
    private mSoundMap: Map<SoundField, Sound>;
    constructor(world: WorldService) {
        super();
        this.world = world;
    }

    addPackListener() {
        const connection = this.world.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL, this.onPlaySoundHandler);
        }
    }

    removePacketListener() {
        const connection = this.world.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    }

    changeRoom(room: IRoomService) {
        if (this.mSoundMap) {
            this.mSoundMap.clear();
        }
        this.mSoundMap = new Map();
        this.mScene = room.scene;
    }

    play(config: any) {
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

    stop(field: SoundField) {
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

    pause(field: SoundField) {
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

    resumes(field: SoundField) {
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
        if (this.mSoundMap) {
            this.mSoundMap.forEach((sound) => { if (sound) sound.destroy(); });
            this.mSoundMap.clear();
            this.mSoundMap = undefined;
        }
        this.removePacketListener();
    }

    private onPlaySoundHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL = packet.content;
        if (content.loop === undefined) {
            content.loop = true;
        }
        // TODO
        this.play({
            key: content.soundKey,
            urls: Url.getOsdRes(content.soundKey),
            field: content.scope,
            soundConfig: { loop: content.loop }
        });
    }
}

class Sound {
    private mKey: string;
    private mSound: Phaser.Sound.BaseSound;
    constructor(private scene: Phaser.Scene) {
    }

    sound(): Phaser.Sound.BaseSound {
        return this.mSound;
    }

    play(key: string, urls?: string | string[], soundConfig?: Phaser.Types.Sound.SoundConfig) {
        if (!this.scene) {
            return;
        }
        if (this.mSound && this.mSound.key === key) {
            if (this.mSound.isPlaying) return;
            this.mSound.play();
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

    private onSoundCompleteHandler() {
        this.startPlay();
    }

    private startPlay() {
        if (this.mSound) {
            this.mSound.stop();
            this.mSound.destroy();
        }
        this.mSound = this.scene.sound.add(this.mKey);
        this.mSound.play();
    }
}
