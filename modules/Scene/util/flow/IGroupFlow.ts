import {IFlow} from "./IFlow";

export interface IGroupFlow {
    pushFlow(childFlow: IFlow);

    getChildFlowIndex(childFlow: IFlow): number;

    getChildFlowCount(): number;


}
