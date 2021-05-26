export enum GameState {
    // ===============登陆游戏时状态:
    // =====第0步 launcher调用render.createGame 创建游戏
    LinkWorker = "LinkWorker",
    // =====第1步 初始化game中user，监听，manager
    CreateManager = "CreateManager",
    // =====第2步 创建远程render account
    CreateAccount = "CreateAccount",
    // =====第1步 初始化game中user，监听，manager
    InitWorld = "InitWorld",
    // =====第3步 尝试链接
    StartConnect = "StartConnect",
    // =====第4步 尝试链接
    Connected = "Connected",
    // =====第5步 请求平台token
    RequestToken = "RequestToken",
    // =====第6步 获得平台token
    GetToken = "GetToken",
    // =====第7步 登陆游戏
    EnterWorld = "EnterWorld", // 发送 _OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
    // =====第8步 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT 包含角色,游戏信息
    PlayerInit = "PlayerInit",
    // =====第9步 成功加载游戏pi
    LoadGameConfig = "LoadGameConfig",
    // =====第10步 成功解析pi
    CompleteDecodeConfig = "CompleteDecodeConfig",
    // =====第11步 游戏创建成功
    GameCreate = "GameCreate", // 发送 _OP_CLIENT_REQ_GATEWAY_GAME_CREATED
    // =====第12步 服务端下发 _OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE 进入场景,客户端进行下载/反序列化 场景数据
    EnterScene = "EnterScene",
    // =====第13步 场景创建成功
    SceneCreate = "SceneCreate",
    // =====第14步 创建房间
    RoomCreate = "RoomCreate",

    // ===============进入游戏后状态：
    // =====第0步 收到房间信息，展示不同ui
    RoomInfo = "RoomInfo",

    // 窗口最小化或被隐藏
    Hidden = "Hidden",

    // 跨游戏状态
    ChangeGame = "ChangeGame",
    // 顶账号状态
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
