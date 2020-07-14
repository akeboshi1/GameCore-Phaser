import { op_client } from "pixelpai_proto";

export class StateListener {
    private mStates: Map<string, any>;
    constructor() {
        this.mStates = new Map();
    }

    add(stateGroups: op_client.IStateGroup[]) {
        if (!stateGroups) {
            return;
        }
        for (const stateGroup of stateGroups) {
            // stateGroup.owner
            // stateGroup.state
            this.mStates.set(stateGroup.owner.name, stateGroup);
            // stateGroup.state[0].execCode
            for (const state of stateGroup.state) {
                if (state.execCode) {

                }
            }
        }
    }

    remove() {

    }
}
