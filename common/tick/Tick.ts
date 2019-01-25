import Globals from "../../Globals";

export class Tick {
    protected m_Timer = 0;
    protected m_StopTime = 0;	// 停止时间
    protected m_AccumulativeTime = 0;	// 累计时间
    protected m_StopFlag = true;
    protected m_EndFlag = false;
    protected m_CallBack: Function;
    protected m_CallBackThisObj: any;
    protected m_RenderCall: Function;
    protected m_RenderCallThisObj: any;
    protected m_Delay: number;

    constructor(delay: number = 33, stopTime: number = 0) {
        this.m_Delay = delay;
        this.m_StopTime = stopTime;
        Globals.TickManager.addTick(this);
    }

    public setCallBack(callBack: Function, thisObj: any): void {
        this.m_CallBack = callBack;
        this.m_CallBackThisObj = thisObj;
    }

    // 具体执行过程，使用override
    protected update(): void {
        if (undefined !== this.m_CallBack) this.m_CallBack.apply(this.m_CallBackThisObj, [this.m_Delay]);
    }

    public setRenderCallBack(callBack: Function, thisObj: any): void {
        this.m_RenderCall = callBack;
        this.m_RenderCallThisObj = thisObj;
    }

    // 这里把计算和渲染分开，用于帧数降低时候，避免无谓的渲染消耗
    protected render(): void {
        if (undefined !== this.m_RenderCall) this.m_RenderCall.apply(this.m_RenderCallThisObj);
    }

    public onTick(timeElapsed: number): void {
        if (this.isEnd()) return;
        if (this.isStop()) return;
        if (this.m_StopTime > 0) {
            this.m_AccumulativeTime += timeElapsed;
            if (this.m_AccumulativeTime > this.m_StopTime) {
                stop();
                return;
            }
        }
        if (this.m_Delay > 0) {
            this.m_Timer += timeElapsed;
            while (this.m_Timer >= this.m_Delay) {
                this.update();
                if (this.isEnd()) break;
                if (this.isStop()) break;
                this.m_Timer -= this.m_Delay;
            }
        }
        // this.render();
    }

    public onRender(): void {
        this.render();
    }

    public start(): void {
        this.m_StopFlag = false;
    }

    public reStart(): void {
        this.m_StopFlag = false;
        this.m_Timer = 0;
        this.m_AccumulativeTime = 0;
    }

    public stop(): void {
        this.m_StopFlag = true;
    }

    public isStop(): boolean {
        return this.m_StopFlag;
    }

    public isEnd(): boolean {
        return this.m_EndFlag;
    }

    public onClear(): void {}

    public onDispose(): void {
        stop();
        this.m_CallBack = null;
        this.m_RenderCall = null;
        this.m_EndFlag = true;
    }
}
