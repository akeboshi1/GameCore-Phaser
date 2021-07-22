import { op_client } from "pixelpai_proto";
export declare class StateListener {
    private mStates;
    constructor();
    add(stateGroups: op_client.IStateGroup[]): void;
    remove(): void;
}
