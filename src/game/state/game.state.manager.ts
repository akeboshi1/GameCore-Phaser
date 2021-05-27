import { GameState } from "structure";
import { Logger } from "utils";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
import { ConnectingState } from "./connecting.state";
import { EnterWorldState } from "./enter.world.state";
import { GameRunningState } from "./game.runing.state";
import { InitState } from "./init.state";
import { LoginState } from "./login.state";

export class GameStateManager {
    protected mMain: MainPeer;
    protected mCurState: BaseState;
    protected mStateMap: Map<string, BaseState>;
    private stateTime: number = 0;
    constructor(main: MainPeer) {
        this.mMain = main;
        this.mStateMap = new Map();
        this.stateTime = new Date().getTime();
        this.init();
    }
    set state(key: string) {
        if (!this.mStateMap) return;
        const state = this.mStateMap.get(key);
        if (!state) {
            Logger.getInstance().error(`state key :"${key}",not exsit`);
        }
        const now: number = new Date().getTime();
        Logger.getInstance().log("gameState: ====>", key, "delayTime:=====>", now - this.stateTime);
        this.stateTime = now;
        this.mCurState = state;
        // =====>设置完当前状态后直接启动
        this.mCurState.run();
    }
    destroy() {
        if (this.mStateMap) {
            this.mStateMap.clear();
        }
    }
    protected init() {
        this.mStateMap[GameState.Init] = new InitState(this.mMain);
        this.mStateMap[GameState.Connecting] = new ConnectingState(this.mMain);
        this.mStateMap[GameState.EnterWorld] = new EnterWorldState(this.mMain);
        this.mStateMap[GameState.Login] = new LoginState(this.mMain);
        this.mStateMap[GameState.GameRunning] = new GameRunningState(this.mMain);
    }
}
