export enum GameState {
    // ===============游戏状态
    // ===== 没有状态
    NoState = "NoState",
    // ===== 游戏初始化
    Init = "Init",
    // ===== 登陆账号
    Login = "Login",
    // ===== 网络链接
    Connecting = "Connecting",
    // ===== 进入游戏
    EnterWorld = "EnterWorld",
    // ===== 游戏运行
    GameRunning = "GameRunning",

    // 跨游戏状态
    ChangeGame = "ChangeGame",
    // 退游戏状态
    OffLine = "OffLine"
}

export enum ConnectState {
    StartConnect,
    Connect,
    ReConnect,
    CloseConnect,
    DisConnect
}

export enum SceneState {
    ScenePreLoad,
    SceneCreate,
    SceneChange, // destroy,create
}

export enum PlayerState {
    IDLE = "idle",
    WALK = "walk",
    RUN = "run",
    ATTACK = "attack",
    JUMP = "jump",
    INJURED = "injured",
    FAILED = "failed",
    DANCE01 = "dance01",
    DANCE02 = "dance02",
    FISHING = "fishing",
    GREET01 = "greet01",
    SIT = "sit",
    LIE = "lit",
    EMOTION01 = "emotion01",
}

export enum PhysicalPeerState {
    CREATEWORLD,
    DESTROYWORLD,
}
