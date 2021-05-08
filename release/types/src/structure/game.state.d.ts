export declare enum GameState {
    LinkWorker = "LinkWorker",
    CreateManager = "CreateManager",
    CreateAccount = "CreateAccount",
    InitWorld = "InitWorld",
    StartConnect = "StartConnect",
    Connected = "Connected",
    RequestToken = "RequestToken",
    GetToken = "GetToken",
    EnterWorld = "EnterWorld",
    PlayerInit = "PlayerInit",
    LoadGameConfig = "LoadGameConfig",
    CompleteDecodeConfig = "CompleteDecodeConfig",
    GameCreate = "GameCreate",
    EnterScene = "EnterScene",
    SceneCreate = "SceneCreate",
    RoomCreate = "RoomCreate",
    RoomInfo = "RoomInfo",
    Hidden = "Hidden"
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
