/**
 * author aaron
 */
namespace Core {
    export class SoundManager extends BaseSingleton {
        /** 音乐文件清理时间 */
        public static CLEAR_TIME: number = 3 * 60 * 1000;

        private _effect: Core.SoundEffect;
        private _bg: Core.SoundBg;
        private _bgOn: boolean;
        private _currBg: string;
        private _bgVolume: number;
        private _effectVolume: number;

        /**
         * 构造函数
         */
        public constructor() {
            super();

            this._bgOn = true;

            this._bgVolume = 1;
            this._effectVolume = 1;

            this._bg = new Core.SoundBg();

            this._effect = new Core.SoundEffect();
        }

        /**
         * 播放音效
         * @param effectName
         * @param loopCount
         */
        public playEffect(effectName: string, loopCount: number = 1): void {
            this._effect.play(effectName, loopCount);
        }

        public stopEffect(): void {
            this._effect.stop();
        }

        /**
         * 播放背景音乐
         * @param key
         */
        public playBg(bgName: string): void {
            this._currBg = bgName;
            if (this._bgOn) {
                this._bg.play(bgName);
            }
        }

        /**
         * 停止背景音乐
         */
        public stopBg(): void {
            this._bg.stop();
        }

        /**
         * 设置音效是否开启
         * @param value
         */
        public setEffectOn(value: boolean): void {
            this._effect.updateVolume(value ? 100 :  0);
        }

        /**
         * 设置背景音乐是否开启
         * @param value
         */
        public setBgOn(value: boolean): void {
            this._bgOn = value;
            if (this._bgOn) {
                if (this._currBg) {
                    this.playBg(this._currBg);
                }
            } else {
                this.stopBg();
            }
        }


        /**
         * 获取背景音乐音量
         * @returns {number}
         */
        public getBgVolume(): number {
            return this._bgVolume;
        }


        /**
         * 获取音效音量
         * @returns {number}
         */
        public getEffectVolume(): number {
            return this._effectVolume;
        }
    }
}