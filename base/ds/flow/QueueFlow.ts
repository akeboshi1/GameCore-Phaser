import {IFlow} from "./IFlow";
import {BasicGroupFlow} from "./BasicGroupFlow";

export class QueueFlow extends BasicGroupFlow {
    public constructor() {
        super();
    }

    public notifyChildFlowComplete(childFlow: IFlow): void {
        let findChildFlow: IFlow = this.childrenFlows.moveFirst();
        this.childrenFlows.remove(findChildFlow);

        if (this.childrenFlows.length === 0) {
            this.onExcuteFlowComplete();
        } else {
            findChildFlow = this.childrenFlows.moveFirst();
            findChildFlow.excuteFlow();
        }
    }

    protected onExcuteFlow(): void {
        if (this.childrenFlows && this.childrenFlows.length > 0) {
            let childFlow: IFlow = this.childrenFlows.moveFirst();
            childFlow.excuteFlow();
        } else {
            this.onExcuteFlowComplete();
        }
    }
}
