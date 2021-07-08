import { GameState, Logger } from "structure";
import { BaseState } from "./base.state";
import { ConnectingState } from "./connecting.state";
import { EnterWorldState } from "./enter.world.state";
import { GameRunningState } from "./game.runing.state";
import { InitState } from "./init.state";
import { LoginState } from "./login.state";
var GameStateManager = /** @class */ (function () {
    function GameStateManager(main) {
        this.stateTime = 0;
        this.mMain = main;
        this.mStateMap = new Map();
        this.stateTime = new Date().getTime();
        this.init();
    }
    Object.defineProperty(GameStateManager.prototype, "curState", {
        get: function () {
            return this.mCurState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStateManager.prototype, "state", {
        get: function () {
            if (!this.mCurState)
                return GameState.NoState;
            return this.mCurState.key;
        },
        set: function (key) {
            if (!this.mStateMap)
                return;
            // 如果开启状态时，存在长期运行的state，比如gameRunning，则需要手动将该state停掉，并且关闭监听
            if (this.mCurState) {
                this.mCurState.removePacketListener();
            }
            var state = this.mStateMap.get(key);
            if (!state) {
                Logger.getInstance().error("state key :\"" + key + "\",not exsit");
            }
            var now = new Date().getTime();
            Logger.getInstance().log("gameState: ====>", key, "delayTime:=====>", now - this.stateTime);
            this.stateTime = now;
            this.mCurState = state;
            // // =====>设置完当前状态后直接启动
            // this.mCurState.run();
        },
        enumerable: true,
        configurable: true
    });
    GameStateManager.prototype.startState = function (state, data) {
        this.state = state;
        this.startRun(data);
    };
    GameStateManager.prototype.refreshStateTime = function () {
        var now = new Date().getTime();
        this.stateTime = now;
    };
    GameStateManager.prototype.startRun = function (data) {
        if (this.mCurState)
            this.mCurState.run(data);
    };
    GameStateManager.prototype.next = function (data) {
        if (this.mCurState)
            this.mCurState.next(data);
    };
    GameStateManager.prototype.update = function (data) {
        if (this.mCurState)
            this.mCurState.update(data);
    };
    GameStateManager.prototype.destroy = function () {
        if (this.mStateMap) {
            this.mStateMap.clear();
        }
    };
    GameStateManager.prototype.init = function () {
        this.mStateMap.set(GameState.Init, new InitState(this.mMain, GameState.Init));
        this.mStateMap.set(GameState.Connecting, new ConnectingState(this.mMain, GameState.Connecting));
        this.mStateMap.set(GameState.EnterWorld, new EnterWorldState(this.mMain, GameState.EnterWorld));
        this.mStateMap.set(GameState.Login, new LoginState(this.mMain, GameState.Login));
        this.mStateMap.set(GameState.GameRunning, new GameRunningState(this.mMain, GameState.GameRunning));
        this.mStateMap.set(GameState.OffLine, new BaseState(this.mMain, GameState.OffLine));
        this.mStateMap.set(GameState.ChangeGame, new BaseState(this.mMain, GameState.ChangeGame));
    };
    return GameStateManager;
}());
export { GameStateManager };
//# sourceMappingURL=game.state.manager.js.map