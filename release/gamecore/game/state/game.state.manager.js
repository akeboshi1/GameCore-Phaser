var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { GameState, Logger } from "structure";
import { BaseState } from "./base.state";
import { ConnectingState } from "./connecting.state";
import { EnterWorldState } from "./enter.world.state";
import { GameRunningState } from "./game.runing.state";
import { InitState } from "./init.state";
import { LoginState } from "./login.state";
export class GameStateManager {
  constructor(main) {
    __publicField(this, "mMain");
    __publicField(this, "mCurState");
    __publicField(this, "mStateMap");
    __publicField(this, "stateTime", 0);
    this.mMain = main;
    this.mStateMap = new Map();
    this.stateTime = new Date().getTime();
    this.init();
  }
  get curState() {
    return this.mCurState;
  }
  get state() {
    if (!this.mCurState)
      return GameState.NoState;
    return this.mCurState.key;
  }
  set state(key) {
    if (!this.mStateMap)
      return;
    if (this.mCurState) {
      this.mCurState.removePacketListener();
    }
    const state = this.mStateMap.get(key);
    if (!state) {
      Logger.getInstance().error(`state key :"${key}",not exsit`);
    }
    const now = new Date().getTime();
    Logger.getInstance().log("gameState: ====>", key, "delayTime:=====>", now - this.stateTime);
    this.stateTime = now;
    this.mCurState = state;
  }
  startState(state, data) {
    this.state = state;
    this.startRun(data);
  }
  refreshStateTime() {
    const now = new Date().getTime();
    this.stateTime = now;
  }
  startRun(data) {
    if (this.mCurState)
      this.mCurState.run(data);
  }
  next(data) {
    if (this.mCurState)
      this.mCurState.next(data);
  }
  update(data) {
    if (this.mCurState)
      this.mCurState.update(data);
  }
  destroy() {
    if (this.mStateMap) {
      this.mStateMap.clear();
    }
  }
  init() {
    this.mStateMap.set(GameState.Init, new InitState(this.mMain, GameState.Init));
    this.mStateMap.set(GameState.Connecting, new ConnectingState(this.mMain, GameState.Connecting));
    this.mStateMap.set(GameState.EnterWorld, new EnterWorldState(this.mMain, GameState.EnterWorld));
    this.mStateMap.set(GameState.Login, new LoginState(this.mMain, GameState.Login));
    this.mStateMap.set(GameState.GameRunning, new GameRunningState(this.mMain, GameState.GameRunning));
    this.mStateMap.set(GameState.OffLine, new BaseState(this.mMain, GameState.OffLine));
    this.mStateMap.set(GameState.ChangeGame, new BaseState(this.mMain, GameState.ChangeGame));
  }
}
