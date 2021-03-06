import { GameState, Logger } from "structure";
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
    get curState(): BaseState {
        return this.mCurState;
    }
    get state(): string {
        if (!this.mCurState) return GameState.NoState;
        return this.mCurState.key;
    }
    set state(key: string) {
        if (!this.mStateMap) return;
        // 如果开启状态时，存在长期运行的state，比如gameRunning，则需要手动将该state停掉，并且关闭监听
        if (this.mCurState) {
            this.mCurState.removePacketListener();
        }
        const state = this.mStateMap.get(key);
        if (!state) {
            Logger.getInstance().error(`state key :"${key}",not exsit`);
        }
        const now: number = new Date().getTime();
        Logger.getInstance().log("gameState: ====>", key, "delayTime:=====>", now - this.stateTime);
        this.stateTime = now;
        this.mCurState = state;
        // // =====>设置完当前状态后直接启动
        // this.mCurState.run();
    }
    startState(state: string, data?: any) {
        this.state = state;
        this.startRun(data);
    }
    refreshStateTime() {
        const now: number = new Date().getTime();
        this.stateTime = now;
    }
    startRun(data?: any) {
        if (this.mCurState) this.mCurState.run(data);
    }
    next(data?: any) {
        if (this.mCurState) this.mCurState.next(data);
    }
    update(data?: any) {
        if (this.mCurState) this.mCurState.update(data);
    }
    destroy() {
        if (this.mStateMap) {
            this.mStateMap.clear();
        }
        this.mCurState = null;
    }
    protected init() {
        this.mStateMap.set(GameState.Init, new InitState(this.mMain, GameState.Init));
        this.mStateMap.set(GameState.Connecting, new ConnectingState(this.mMain, GameState.Connecting));
        this.mStateMap.set(GameState.EnterWorld, new EnterWorldState(this.mMain, GameState.EnterWorld));
        this.mStateMap.set(GameState.Login, new LoginState(this.mMain, GameState.Login));
        this.mStateMap.set(GameState.GameRunning, new GameRunningState(this.mMain, GameState.GameRunning));
        this.mStateMap.set(GameState.OffLine, new BaseState(this.mMain, GameState.OffLine));
        this.mStateMap.set(GameState.ChangeGame, new BaseState(this.mMain, GameState.ChangeGame));
    }
}
