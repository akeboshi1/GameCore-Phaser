export var GameState;
(function (GameState) {
    // ===============游戏状态
    // ===== 没有状态
    GameState["NoState"] = "NoState";
    // ===== 游戏初始化
    GameState["Init"] = "Init";
    // ===== 登陆账号
    GameState["Login"] = "Login";
    // ===== 网络链接
    GameState["Connecting"] = "Connecting";
    // ===== 进入游戏
    GameState["EnterWorld"] = "EnterWorld";
    // ===== 游戏运行
    GameState["GameRunning"] = "GameRunning";
    // 跨游戏状态
    GameState["ChangeGame"] = "ChangeGame";
    // 退游戏状态
    GameState["OffLine"] = "OffLine";
})(GameState || (GameState = {}));
export var ConnectState;
(function (ConnectState) {
    ConnectState[ConnectState["StartConnect"] = 0] = "StartConnect";
    ConnectState[ConnectState["Connect"] = 1] = "Connect";
    ConnectState[ConnectState["ReConnect"] = 2] = "ReConnect";
    ConnectState[ConnectState["CloseConnect"] = 3] = "CloseConnect";
    ConnectState[ConnectState["DisConnect"] = 4] = "DisConnect";
})(ConnectState || (ConnectState = {}));
export var SceneState;
(function (SceneState) {
    SceneState[SceneState["ScenePreLoad"] = 0] = "ScenePreLoad";
    SceneState[SceneState["SceneCreate"] = 1] = "SceneCreate";
    SceneState[SceneState["SceneChange"] = 2] = "SceneChange";
})(SceneState || (SceneState = {}));
export var PlayerState;
(function (PlayerState) {
    PlayerState["IDLE"] = "idle";
    PlayerState["WALK"] = "walk";
    PlayerState["RUN"] = "run";
    PlayerState["ATTACK"] = "attack";
    PlayerState["JUMP"] = "jump";
    PlayerState["INJURED"] = "injured";
    PlayerState["FAILED"] = "failed";
    PlayerState["DANCE01"] = "dance01";
    PlayerState["DANCE02"] = "dance02";
    PlayerState["FISHING"] = "fishing";
    PlayerState["GREET01"] = "greet01";
    PlayerState["SIT"] = "sit";
    PlayerState["LIE"] = "lit";
    PlayerState["EMOTION01"] = "emotion01";
})(PlayerState || (PlayerState = {}));
export var PhysicalPeerState;
(function (PhysicalPeerState) {
    PhysicalPeerState[PhysicalPeerState["CREATEWORLD"] = 0] = "CREATEWORLD";
    PhysicalPeerState[PhysicalPeerState["DESTROYWORLD"] = 1] = "DESTROYWORLD";
})(PhysicalPeerState || (PhysicalPeerState = {}));
//# sourceMappingURL=game.state.js.map