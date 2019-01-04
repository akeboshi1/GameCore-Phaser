import BaseSingleton from "../../base/BaseSingleton";
import {Sound} from "../../Assets";

export class SoundManager extends BaseSingleton {
    private game: Phaser.Game;
    static DEFAULT_VALUE = 0.5;
    private m_BgSound: Phaser.Sound;
    private m_GameSound: Phaser.SoundManager;

    constructor() {
        super();
    }

    private _mute: number = 1;

    public get mute(): number {
        return this._mute;
    }

    public set mute(value: number) {
        this._mute = value;
        this.bgVolume = this._bgVolume * this._mute;
        this.gameVolume = this._gameVolume * this._mute;
    }

    private _bgVolume: number = SoundManager.DEFAULT_VALUE;

    public get bgVolume(): number {
        return this._bgVolume;
    }

    public set bgVolume(value: number) {
        this._bgVolume = value;
        if (this.m_BgSound)
            this.m_BgSound.volume = value;
    }

    private _gameVolume: number = SoundManager.DEFAULT_VALUE;

    public get gameVolume(): number {
        return this._gameVolume;
    }

    public set gameVolume(value: number) {
        this._gameVolume = value;
        if (this.m_GameSound)
            this.m_GameSound.volume = value;
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        this.m_GameSound = new Phaser.SoundManager(this.game);
    }

    public playBgSound(soundId: number): void {
        if (soundId <= 0) return;
        if (this.m_BgSound === undefined) {
            this.m_BgSound = this.game.sound.play(Sound.BgSound.getName(soundId), this.bgVolume, true);
        } else {
            this.m_BgSound.play(Sound.BgSound.getName(soundId));
        }
    }

    public toggleBgSound(value: boolean): void {
        if (this.m_BgSound === undefined) return;
        if (value) this.m_BgSound.pause();
        else this.m_BgSound.play();
    }

    public playGameSound(soundId: number): void {
        if (soundId <= 0) return;
        this.m_GameSound.play(Sound.GameSound.getName(soundId), this.gameVolume, false);
    }

    public toggleGameSound(value: boolean): void {
        if (value) {
            this.m_GameSound.resumeAll();
        } else {
            this.m_GameSound.pauseAll();
        }
    }

    public dispose(): void {
       if (this.m_GameSound) {
         this.m_GameSound.destroy();
       }
       if (this.m_BgSound) {
         this.m_BgSound.destroy(true);
       }
    }
}
