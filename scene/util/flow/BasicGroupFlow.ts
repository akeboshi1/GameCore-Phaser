import UniqueLinkList from "../UniqueLinkList";
import {IFlow} from "./IFlow";
import {IGroupFlow} from "./IGroupFlow";
import {BasicFlow} from "./BasicFlow";

export class BasicGroupFlow extends BasicFlow implements IGroupFlow {
    protected childrenFlows: UniqueLinkList;

    public constructor() {
        super();
    }

    public pushFlow(childFlow: IFlow): void {
        this.childrenFlows.add(childFlow);
        childFlow.setParentFlow(this);
    }

    public getChildFlowIndex(childFlow: IFlow): number {
        if (this.childrenFlows) {
            let findChildIndex: number = 0;
            let findChildFlow: IFlow = this.childrenFlows.moveFirst();
            while (findChildFlow) {
                if (findChildFlow === childFlow) return findChildIndex;

                findChildIndex++;
                findChildFlow = this.childrenFlows.moveNext();
            }
        }
        return -1;
    }

    public getChildFlowCount(): number {
        return this.childrenFlows ? this.childrenFlows.length : 0;
    }

    public clear(): void {
        if (this.childrenFlows) {
            let childFlow: IFlow = this.childrenFlows.moveFirst();
            while (childFlow) {
                childFlow.dispose();
                childFlow = this.childrenFlows.moveNext();
            }
            this.childrenFlows.clear();
        }
    }

    public dispose(): void {
        super.dispose();
        if (this.childrenFlows) {
            let childFlow: IFlow = this.childrenFlows.moveFirst();
            while (childFlow) {
                childFlow.dispose();
                childFlow = this.childrenFlows.moveNext();
            }
            this.childrenFlows = null;
        }
    }

    protected onInitialize(): void {
        this.childrenFlows = new UniqueLinkList();
    }
}
