import { op_def, op_client } from "pixelpai_proto";
import { StateParse } from "./parse";

export class StateGroup {
    private mName: string;
    private states: State[];
    constructor() {
        this.states = [];
    }

    update(group: op_client.IStateGroup) {
        this.mName = group.owner.name;
    }
}

export class State {
    public name: string;
    public type: op_def.NodeType;
    public packet: any;
    constructor(state: op_def.IState) {
        this.type = state.type;
        this.name = state.name;
        if (state.packet) {
            // TODO 外部拿不到packet类型
            this.packet = StateParse.decode(state.name, state.packet);
        }
    }
}
