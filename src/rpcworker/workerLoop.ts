export class WorkerLoop {
    private _delta: number = 100;
    private _loopMap: Map<string, ILoop>;
    private _timeID;
    private _isRuning: boolean = false;
    private _pause: boolean = false;
    constructor() {
        this._loopMap = new Map();
    }
    add(id: string, data: ILoop) {
        this._loopMap.set(id, data);
    }
    remove(id) {
        if (!this._loopMap.has(id)) return;
        this._loopMap.delete(id);
    }
    start() {
        if (this._isRuning) return;
        this._isRuning = true;
        this._timeID = setInterval(() => {
            // self = DedicatedWorkerGlobalScope worker的全局对象，能获取到setTimeout，setInterval等方法
            if (!this._loopMap || !this._loopMap.size) return;
            this._loopMap.forEach((loop: ILoop) => {
                loop.update();
            });
        }, this._delta);
    }
    pause() {
        this._pause = true;
    }
    resume() {
        this._pause = false;
    }
    stop() {
        if (!this._isRuning || this._pause) return;
        this._isRuning = false;
        clearInterval(this._timeID);
    }
    destroy() {
        this.stop();
        this._pause = false;
        // for (const key in this._loopMap) {
        //     const loop = this._loopMap[key];
        //     loop.stop();
        // }
        this._loopMap.clear();
    }
}

export interface ILoop {
    update();
}
