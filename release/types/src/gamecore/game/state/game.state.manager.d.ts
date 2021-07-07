import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export declare class GameStateManager {
    protected mMain: MainPeer;
    protected mCurState: BaseState;
    protected mStateMap: Map<string, BaseState>;
    private stateTime;
    constructor(main: MainPeer);
    get curState(): BaseState;
    get state(): string;
    set state(key: string);
    startState(state: string, data?: any): void;
    refreshStateTime(): void;
    startRun(data?: any): void;
    next(data?: any): void;
    update(data?: any): void;
    destroy(): void;
    protected init(): void;
}
