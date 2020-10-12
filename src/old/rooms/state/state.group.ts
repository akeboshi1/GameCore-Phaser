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
    private mName: string;
    private mType: op_def.NodeType;
    private mPacket: any;
    constructor(state: op_def.IState) {
        this.mType = state.type;
        this.mName = state.name;
        if (state.packet) {
            // TODO 外部拿不到packet类型
            this.mPacket = StateParse.decode(state.name, state.packet);
        }
    }

    get name(): string {
        return this.mName;
    }

    get type(): op_def.NodeType {
        return this.mType;
    }

    get packet(): any {
        return this.mPacket;
    }
}
