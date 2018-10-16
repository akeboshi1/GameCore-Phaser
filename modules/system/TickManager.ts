/**
 * 全局触发器
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import Game from "../../Game";

export class TickManager extends BaseSingleton {
    public game: Game;
    private _timeHandleList: Object[];
    private _frameHandleList: Object[];

    public constructor() {
        super();
        this._timeHandleList = [];
        this._frameHandleList = [];
    }

    /**
     *
     * 增加计时触发器
     * @param interval 时间间隔:毫秒
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     * @param triggerImmediately 是否立刻执行一次
     */
    public addTime(method: Function, thisObj: any, interval: number = 33, triggerImmediately: Boolean = false): void {
        this.removeTime(method, thisObj);
        var handle: Object = {"interval": interval, "method": method, "thisObj": thisObj, "lastTime": this.game.time.elapsed};
        this._timeHandleList.push(handle);
        if (triggerImmediately) {
            method.apply(thisObj);
        }
    }

    /**
     * 移除计时触发器
     * @param method 要移除的函数
     * @param thisObj 要移除的函数对应的this对象
     */
    public removeTime(method: Function, thisObj: any): void {
        var handle: Object;
        for (var i: number = this._timeHandleList.length - 1; i >= 0; i--) {
            handle = this._timeHandleList[i];
            if (handle["method"] == method && handle["thisObj"] == thisObj) {
                this._timeHandleList.splice(i, 1);
            }
        }
    }

    /**
     * 增加帧触发器(每帧触发)
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     * @param triggerImmediately 是否立刻执行一次
     */
    public addFrame(method: Function, thisObj: any, triggerImmediately: Boolean = false): void {
        this.removeFrame(method, thisObj);
        var handle: Object = {"method": method, "thisObj": thisObj, "lastTime": this.game.time.elapsed};
        this._frameHandleList.push(handle);
        if (triggerImmediately) {
            method.apply(thisObj);
        }
    }

    /**
     * 移除帧触发器
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     */
    public removeFrame(method: Function, thisObj: any): void {
        var handle: Object;
        for (var i: number = this._frameHandleList.length - 1; i >= 0; i--) {
            handle = this._frameHandleList[i];
            if (handle["method"] == method && handle["thisObj"] == thisObj) {
                this._frameHandleList.splice(i, 1);
            }
        }
    }

    public onEnterFrame(elapsed: number): boolean {
        let curTime: number = elapsed;
        let deltaTime: number;
        if (this._timeHandleList.length > 0) {
            var handle: Object;
            for (let i: number = 0; i < this._timeHandleList.length; i++) {
                handle = this._timeHandleList[i];
                deltaTime = curTime - handle["lastTime"];
                if (deltaTime >= handle["interval"]) {
                    handle["lastTime"] = curTime;
                    handle["method"].apply(handle["thisObj"], [handle["interval"] * 0.001]);
                }
            }
        }
        if (this._frameHandleList.length > 0) {
            for (let i: number = 0; i < this._frameHandleList.length; i++) {
                handle = this._frameHandleList[i];
                deltaTime = curTime - handle["lastTime"];
                handle["lastTime"] = curTime;
                handle["method"].apply(handle["thisObj"], [deltaTime * 0.001]);
            }
        }
        return true;
    }

}
    

