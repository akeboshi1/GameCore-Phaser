import { op_client } from "pixelpai_proto";
import { IRoomService } from "..";
import { State } from "./state.group";
export declare class BaseStateManager {
    protected room: IRoomService;
    protected add: BaseHandler;
    protected delete: BaseHandler;
    protected stateMap: Map<string, State>;
    constructor(room: IRoomService);
    setState(stateGroup: op_client.IStateGroup): void;
    handleStates(states: Map<string, State>): void;
    destroy(): void;
    protected handleState(state: State): void;
    protected init(): void;
}
export declare class BaseHandler {
    protected room: IRoomService;
    constructor(room: IRoomService);
    handler(state: State): void;
    init(param?: any): void;
}
