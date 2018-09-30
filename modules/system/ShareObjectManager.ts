import BaseSingleton from '../../base/BaseSingleton';
import GameConst = Core.GameConst;
import Timer = Phaser.Timer;

class ShareObjectManager extends BaseSingleton {
    private _cachedShareObjects: Object = {};
    private _markedShareObjects: Object = {};
    private _timer: Timer;

    public constructor() {
        super();
    }

    public get swipTime(): number {
        return GameConst.SHARE_OBJECT_CACHE_SWIP_TIME;
    }

    public run(): void {
        if (this._timer == null) {
            this._timer = new Timer(this.swipTime);
        }
        else {
            if (this._timer.running) {
                this._timer.reset();
            }

            this._timer.delay = this.swipTime;
        }

        if (!this._timer.hasEventListener(TimerEvent.TIMER)) {
            this._timer.addEventListener(egret.TimerEvent.TIMER, this.shareObjectSwipTimerCompleteHandler, this);
        }

        this._timer.start();
    }

    public stop(): void {
        if (this._timer != null) {
            this._timer.reset();

            if (this._timer.hasEventListener(egret.TimerEvent.TIMER)) {
                this._timer.removeEventListener(egret.TimerEvent.TIMER, this.shareObjectSwipTimerCompleteHandler, this);
            }
        }
    }

    public setSwipTimeDelta(value: number): void {
        if (!this._timer) {
            this._timer = new egret.Timer(value);
            this._timer.addEventListener(egret.TimerEvent.TIMER, this.shareObjectSwipTimerCompleteHandler, this);
        }
        else {
            this._timer.reset();
            this._timer.delay = value;
        }

        this._timer.start();
    }

    public swipMarkedSharedObjects(): void {
        var shareObjectData: ShareObjectData;
        for (let key in this._markedShareObjects) {
            shareObjectData = this._markedShareObjects[key];
            try {
                if (shareObjectData.shareObject && Object(shareObjectData.shareObject).hasOwnProperty('dispose')) {
                    shareObjectData.shareObject.dispose();
                    Log.trace('!!!!!!!!!!ShareObjectSwip realease key: ' + key);
                }
            }
            catch (error) {
            }

            delete this._markedShareObjects[key];
        }
    }

    public registShareObject(key: string, shareObject: any): void {
        if (!this._markedShareObjects[key] && !this._cachedShareObjects[key]) {
            var shareObjectData: ShareObjectData = new ShareObjectData();
            shareObjectData.key = key;
            shareObjectData.shareObject = shareObject;
            this._markedShareObjects[key] = shareObjectData;
        }
    }

    public hasRegistShareObject(key: string): boolean {
        return this._markedShareObjects[key] || this._cachedShareObjects[key];
    }

    public fetchShareObject(key: string): any {
        var shareObjectData: ShareObjectData = null;

        shareObjectData = this._markedShareObjects[key] as ShareObjectData;
        if (shareObjectData != null) {
            shareObjectData.referenceCount++;

            delete this._markedShareObjects[key];
            this._cachedShareObjects[key] = shareObjectData;

            return shareObjectData.shareObject;
        }

        shareObjectData = this._cachedShareObjects[key] as ShareObjectData;
        if (shareObjectData != null) {
            shareObjectData.referenceCount++;
            return shareObjectData.shareObject;
        }

        return null;
    }

    public releaseShareObject(key: string): void {
        var shareObjectData: ShareObjectData = this._cachedShareObjects[key] as ShareObjectData;
        if (shareObjectData != null) {
            if (shareObjectData.referenceCount > 0) {
                shareObjectData.referenceCount--;
            }

            if (shareObjectData.referenceCount == 0) {
                delete this._cachedShareObjects[key];
                this._markedShareObjects[key] = shareObjectData;
            }
        }
    }

    private shareObjectSwipTimerCompleteHandler(event: egret.TimerEvent): void {
        this.swipMarkedSharedObjects();
    }

}

class ShareObjectData {
    public key: String;
    public shareObject: any;
    public referenceCount: number = 0;
}
