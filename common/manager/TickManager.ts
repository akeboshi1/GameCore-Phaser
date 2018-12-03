/**
 * 全局触发器
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import {Log} from "../../Log";

export class TickManager extends BaseSingleton {

    private game: Phaser.Game;
    private _tickHandleList: Object[];
    private _frameHandleList: Object[];
    private _initilized: boolean = false;

    public constructor() {
        super();
    }

    public get initilized(): boolean {
        return this._initilized;
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        this._tickHandleList = [];
        this._frameHandleList = [];
        this._initilized = true;
    }

    /**
     *
     * 增加计时触发器
     * @param interval 时间间隔:毫秒
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     * @param triggerImmediately 是否立刻执行一次
     */
    public addTick(method: Function, thisObj: any): void {
        this.removeTick(method, thisObj);
        let handle: Object = {
            "method": method,
            "thisObj": thisObj,
            "lastTime": this.game.time.now
        };
        this._tickHandleList.push(handle);
    }

    /**
     * 移除计时触发器
     * @param method 要移除的函数
     * @param thisObj 要移除的函数对应的this对象
     */
    public removeTick(method: Function, thisObj: any): void {
        let handle: Object;
        for (let i: number = this._tickHandleList.length - 1; i >= 0; i--) {
            handle = this._tickHandleList[i];
            if (handle["method"] === method && handle["thisObj"] === thisObj) {
                this._tickHandleList.splice(i, 1);
            }
        }
    }

    /**
     * 增加帧触发器(每帧触发)
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     * @param triggerImmediately 是否立刻执行一次
     */
    public addFrame(method: Function, thisObj: any): void {
        this.removeFrame(method, thisObj);
        let handle: Object = {"method": method, "thisObj": thisObj, "lastTime": this.game.time.now};
        this._frameHandleList.push(handle);
    }

    /**
     * 移除帧触发器
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     */
    public removeFrame(method: Function, thisObj: any): void {
        let handle: Object;
        for (let i: number = this._frameHandleList.length - 1; i >= 0; i--) {
            handle = this._frameHandleList[i];
            if (handle["method"] === method && handle["thisObj"] === thisObj) {
                this._frameHandleList.splice(i, 1);
            }
        }
    }

    public onTickCall(): void {
        if (!this.initilized) return;
        let curTime: number = this.game.time.now;
        let handle: Object;
        let deltaTime: number;
        for (let i: number = 0; i < this._tickHandleList.length; i++) {
            handle = this._tickHandleList[i];
            deltaTime = curTime - handle["lastTime"];
            // Log.trace("elapsed-->",deltaTime)
            handle["lastTime"] = curTime;
            handle["method"].apply(handle["thisObj"], [deltaTime * 0.001]); // s
        }
    }

    public onFrameCall(): void {
        if (!this.initilized) return;
        let curTime: number = this.game.time.now;
        let handle: Object;
        let deltaTime: number;
        for (let i: number = 0; i < this._frameHandleList.length; i++) {
            handle = this._frameHandleList[i];
            deltaTime = curTime - handle["lastTime"];
            // Log.trace("elapsed-->",deltaTime)
            handle["lastTime"] = curTime;
            handle["method"].apply(handle["thisObj"], [deltaTime * 0.001]); // s
        }
    }
}


