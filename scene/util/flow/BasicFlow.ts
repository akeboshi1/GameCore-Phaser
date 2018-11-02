import {IFlow} from "./IFlow";

export class BasicFlow implements IFlow {
    protected mParent: IFlow;
    protected myData: any;
    private mIsInited: boolean = false;
    private mCalllaterExcuteFlowCompleteTimeHandler: number = -1;

    public constructor() {
    }

    public setData(value: any): void {
        this.myData = value;
    }

    public initialize(): void {
        if (this.mIsInited === false) {
            this.mIsInited = true;
            this.onInitialize();
        }
    }

    public excuteFlow(): void {
        this.initialize();
        this.onExcuteFlow();
    }

    public getRootFlow(): IFlow {
        let f: IFlow = this;
        let p: IFlow;
        while (f) {
            p = f.getParentFlow();
            if (p == null) return f;
            f = p;
        }
        return f;
    }

    public setParentFlow(value: IFlow): void {
        this.mParent = value;
    }

    public getParentFlow(): IFlow {
        return this.mParent;
    }

    public notifyChildFlowComplete(childFlow: IFlow): void {
        throw new Error("BasicFlow::notifyChildFlowComplete");
    }

    public dispose(): void {
        this.mParent = null;
        this.mIsInited = false;
        this.myData = null;
    }

    protected onInitialize(): void {

    }

    protected onExcuteFlow(): void {
    }

    protected onExcuteFlowComplete(): void {
        this.mCalllaterExcuteFlowCompleteTimeHandler = -1;
        if (this.mParent) this.mParent.notifyChildFlowComplete(this);
        this.dispose();
    }

    protected calllaterExcuteFlowComplete(time: number = 0): void {
        if (time === 0) {
            this.onExcuteFlowComplete();
        } else {
            this.mCalllaterExcuteFlowCompleteTimeHandler = setTimeout(this.onExcuteFlowComplete, this, time);
        }
    }
}
