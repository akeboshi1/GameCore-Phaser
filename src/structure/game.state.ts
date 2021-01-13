export enum GameState {
    // ===============登陆游戏时状态:
    // =====第1步 launcher调用render.createGame 创建游戏
    LinkWorker,
    // =====第2步 尝试链接
    StartConnect,
    // =====第3步 登陆游戏
    EnterWorld, // 发送 _OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT
    // =====第4步 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT 包含角色,游戏信息,客户端进行下载/反序列化 游戏数据
    PlayerInit,
    // =====第5步 游戏创建成功
    GameCreate, // 发送 _OP_CLIENT_REQ_GATEWAY_GAME_CREATED
    // =====第6步 服务端下发 _OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE 进入场景,客户端进行下载/反序列化 场景数据
    EnterScene,
    // =====第7步 创建房间
    RoomCreate,
    // =====第8步 场景创建成功
    SceneCreate,
    // ===============进入游戏后状态：
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
