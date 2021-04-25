import { op_def, op_client, op_gameconfig_01 } from "pixelpai_proto";
export declare class StateGroup {
    private mName;
    private states;
    constructor();
    update(group: op_client.IStateGroup): void;
}
export declare class State {
    owner: op_gameconfig_01.INode;
    name: string;
    type: op_def.NodeType;
    packet: Uint8Array;
    execCode: op_def.ExecCode;
    constructor(state: op_def.IState, owner: op_gameconfig_01.INode);
}
