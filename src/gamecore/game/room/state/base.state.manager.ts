import { op_def, op_client } from "pixelpai_proto";
import { Logger } from "structure";
import { IRoomService } from "..";
import { State } from "./state.group";

export class BaseStateManager {
    protected add: BaseHandler;
    protected delete: BaseHandler;
    protected stateMap: Map<string, State>;
    constructor(protected room: IRoomService) {
        this.init();
    }

    setState(stateGroup: op_client.IStateGroup) {
        if (!this.stateMap) this.stateMap = new Map();
        const { owner, state } = stateGroup;
        const waitExec = new Map();
        for (const sta of state) {
            const parse = new State(sta, owner);
            this.stateMap.set(parse.name, parse);
            waitExec.set(parse.name, parse);
        }
        this.handleStates(waitExec);
    }

    handleStates(states: Map<string, State>) {
        if (!states) return;
        states.forEach((state) => this.handleState(state));
        states.clear();
    }

    destroy() {
        if (!this.stateMap) return;
        this.stateMap.forEach((state) => this.delete.handler(state));
        this.stateMap.clear();
        this.add = null;
        this.delete = null;
    }

    protected handleState(state: State) {
        switch (state.execCode) {
            case op_def.ExecCode.EXEC_CODE_ADD:
            case op_def.ExecCode.EXEC_CODE_UPDATE:
                this.add.handler(state);
                break;
            case op_def.ExecCode.EXEC_CODE_DELETE:
                this.delete.handler(state);
                break;
            default:
                Logger.getInstance().warn(`${state.execCode} is not defined`);
                break;
        }
    }

    protected init() {
    }
}

export class BaseHandler {
    constructor(protected room: IRoomService) {
    }

    public handler(state: State) {
        if (!state) {
            return;
        }
        const fun = this[state.name];
        if (!fun) {
            return Logger.getInstance().warn(`${state.name} is not defined definition`);
        }
        fun.call(this, state);
    }

    public init(param?: any) {
    }
}
