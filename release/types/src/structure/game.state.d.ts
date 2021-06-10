export declare enum GameState {
    NoState = "NoState",
    Init = "Init",
    Login = "Login",
    Connecting = "Connecting",
    EnterWorld = "EnterWorld",
    GameRunning = "GameRunning",
    OffLine = "OffLine"
}
export declare enum ConnectState {
    StartConnect = 0,
    Connect = 1,
    ReConnect = 2,
    CloseConnect = 3,
    DisConnect = 4
}
export declare enum SceneState {
    ScenePreLoad = 0,
    SceneCreate = 1,
    SceneChange = 2
}
export declare enum PlayerState {
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
    EMOTION01 = "emotion01"
}
export declare enum PhysicalPeerState {
    CREATEWORLD = 0,
    DESTROYWORLD = 1
}
