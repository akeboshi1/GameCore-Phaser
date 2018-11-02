import {QueueFlow} from "../scene/util/flow/QueueFlow";
import {RoomScene} from "../scene/RoomScene";
import {IFlow} from "../scene/util/flow/IFlow";
import {Log} from "../Log";

export class FlowManager extends QueueFlow {
    private _view: RoomScene;

    public constructor() {
        super();
    }

    public setView(value: RoomScene): void {
        this._view = value;
    }

    public getView(): RoomScene {
        return this._view;
    }

    public pushFlow(childFlow: IFlow): void {
        super.pushFlow(childFlow);
        if (this.getChildFlowCount() === 1) {
            childFlow.excuteFlow();
        }
    }

    public notifyChildFlowComplete(childFlow: IFlow): void {
        let findChildFlow: IFlow = this.childrenFlows.moveFirst();
        this.childrenFlows.remove(findChildFlow);

        if (this.childrenFlows.length === 0) {
            Log.trace("flow empty.");
        }
        else {
            findChildFlow = this.childrenFlows.moveFirst();
            findChildFlow.excuteFlow();
        }
    }

    public dispose(): void {
        this._view = null;
        super.dispose();
    }
}
