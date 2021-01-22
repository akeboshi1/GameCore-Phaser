export enum GameState {
    // ===============登陆游戏时状态:
    // =====第0步 launcher调用render.createGame 创建游戏
    LinkWorker = "LinkWorker",
    // =====第1步 尝试链接
    StartConnect = "StartConnect",
    // =====第2步 请求平台token
    RequestToken = "RequestToken",
    // =====第3步 获得平台token
    GetToken = "GetToken",
    // =====第4步 登陆游戏
    EnterWorld = "EnterWorld", // 发送 _OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
    // =====第5步 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT 包含角色,游戏信息
    PlayerInit = "PlayerInit",
    // =====第6步 成功加载游戏pi
    LoadGameConfig = "LoadGameConfig",
    // =====第7步 成功解析pi
    CompleteDecodeConfig = "CompleteDecodeConfig",
    // =====第8步 游戏创建成功
    GameCreate = "GameCreate", // 发送 _OP_CLIENT_REQ_GATEWAY_GAME_CREATED
    // =====第9步 服务端下发 _OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE 进入场景,客户端进行下载/反序列化 场景数据
    EnterScene = "EnterScene",
    // =====第10步 场景创建成功
    SceneCreate = "SceneCreate",
    // =====第11步 创建房间
    RoomCreate = "RoomCreate",

    // ===============进入游戏后状态：
    // =====第9步 收到房间信息，展示不同ui
    RoomInfo = "RoomInfo",
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
