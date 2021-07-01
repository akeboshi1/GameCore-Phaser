export class EventType {
    // ============== worker event name
    public static PACKAGE_SYNC_FINISH = "PACKAGE_SYNC_FINISH";// 同步背包完成
    public static PACKAGE_UPDATE = "PACKAGE_UPDATE"; // 背包更新
    public static UPDATE_PLAYER_INFO = "UPDATE_PLAYER_INFO"; // 更新玩家数据
    public static UPDATE_ROOM_INFO = "UPDATE_ROOM_INFO"; // 更新房间信息
    public static UPDATE_EXTRA_ROOM_INFO = "UPDATE_EXTRA_ROOM_INFO"; // 更新额外房间信息
    public static UPDATE_PARTY_STATE = "UPDATE_PARTY_STATE"; // 刷新派对状态
    public static SEND_FURNITURE_REQUIREMENTS = "SEND_FURNITURE_REQUIREMENTS"; // 家具冻结修复材料
    public static SCENE_ELEMENT_DATA_UPDATE = "SCENE_ELEMENT_DATA_UPDATE";// 场景元素数据刷新
    public static QUERY_MARKET = "QUERY_MARKET"; // 刷新市场数据
    public static CHAT = "CHAT"; // 聊天
    public static SCENE_POINT_ELEMENT = "SCENE_ELEMENT";// 点击的场景元素
    public static SCENE_SHOW_UI = "SCENE_SHOW_UI";// 点击场景元素显示UI;
    public static ELEMENT_ITEM_CONFIG = "ELEMENT_ITEM_CONFIG";// 场景元素和道具配置请求
    public static SEND_GIFT_DATA_UPDATE = "SEND_GIFT_DATA_UPDATE";// 派对赠送礼物数据
    public static SCENE_ELEMENT_FIND = "SCENE_ELEMENT_FIND";// 场景元素查找
    public static SCENE_RETURN_FIND_ELEMENT = "SCENE_RETURN_FIND_ELEMENT";// 返回查找的场景元素
    public static SCENE_PLAYER_FIND = "SCENE_PLAYER_FIND";// 场景玩家查找
    public static SCENE_RETURN_FIND_PLAYER = "SCENE_RETURN_FIND_PLAYER";// 返回查找的场景玩家
    public static SCENE_INTERACTION_ELEMENT = "SCENE_INTERACTION_ELEMENT";// 场景交互元素
    public static SCENE_PLAYER_ACTION = "SCENE_PLAYER_ACTION";// 场景玩家执行行为动作
    public static SCENE_SHOW_MAIN_UI = "SCENE_SHOW_MAIN_UI"; // 显示场景主界面
    public static CHAT_PANEL_EXTPAND = "CHAT_PANEL_EXTPAND";// 聊天面板展开
    public static SCENE_CHANGE = "SCENE_CHANGE";// 切换场景
    public static QUERY_SURVEY_FURNITURE = "QUERY_SURVEY_FURNITURE";// 请求调查家具
    public static ENTER_SURVEY_FURNITURE_STATUSE = "ENTER_SURVEY_FURNITURE_STATUSE";// 进入家具调查状态
    public static EXECUTE_SURVEY_FURNITURE = "EXECUTE_SURVEY_FURNITURE"; // TEMP: 执行调查家具
    public static FECTH_FOLD_MAIN_UI = "FECTH_FOLD_MAIN_UI"; // 请求折叠主界面
    public static CAN_LIKE_ROOM = "CAN_LIKE_ROOM"; // 是否可以点赞
    /**
     * 请求好友、关注、粉丝数据
     */
    public static FETCH_FRIEND: string = "fetchFriend";

    /**
     * 关注
     */
    public static FOLLOW: string = "follow";

    /**
     * 取消关注
     */
    public static UNFOLLOW: string = "unfollow";

    /**
     * 移除黑名单
     */
    public static REMOVE_BAN_USER: string = "removeBanUser";

    /**
     * 请求黑名单
     */
    public static REQ_BLACKLIST: string = "ReqBlacklist";

    /**
     * 请求好友属性，并打开好友属性面板
     */
    public static REQ_FRIEND_ATTRIBUTES: string = "reqFriendAttributes";

    /**
     * 请求好友游戏数据
     */
    public static REQ_FRIEND_GAME_DATA: string = "reqFriendGameData";

    /**
     * 从黑名单移除
     */
    public static REMOVE_FROM_BLACKLIST: string = "removeFromBlacklist";

    /**
     * renderer emit event
     */
    public static RENDERER_EVENT: string = "rendererEvent";

    /**
     * 请求游戏好友
     */
    public static REQ_PLAYER_LIST: string = "reqPlayerList";

    /**
     * 游戏好友列表
     */
    public static PLAYER_LIST: string = "playerList";

    /**
     * 搜索好友
     */
    public static SEARCH_FRIEND: string = "searchFriend";

    /**
     * Server返回的搜索结果
     */
    public static SEARCH_RESULT: string = "searchResult";

    /**
     * 请求好友关系
     */
    public static REQ_FRIEND_RELATION: string = "reqFriendRelation";

    /**
     * 请求好友关系
     */
    public static REQ_RELATION: string = "reqRelation";

    /**
     * 请求新增粉丝
     */
    public static REQ_NEW_FANS: string = "reqNewFans";

    // ============== render event name
    public static SHOW_MED = "SHOW_MED";
    public static QUERY_PRAISE = "QUERY_PRAISE";
    public static QUERY_MARKET_REQUEST = "QUERY_MARKET_REQUEST";
    public static REQUEST_TARGET_UI = "REQUEST_TARGET_UI";

    /**
     * navigate初始化好，修改PlayCamera大小
     */
    public static NAVIGATE_RESIZE = "navigateResize";

    /**
     * 命令协议测试
     */
    public static TEST_COMMAND_MESSAGE = "TEST_COMMAND_MESSAGE";
    /**
     * 图鉴数据更新
     */
    public static GALLERY_UPDATE = "GALLERY_UPDATE";
    public static DONE_MISSION_LIST = "DONE_MISSION_LIST";// 收集奖励领取

    /**
     * 请求家具PI数据
     */
    public static QUEST_ELEMENT_PI_DATA = "QUEST_ELEMENT_PI_DATA";

    /**
     * 返回家具PI数据
     */
    public static RETURN_ELEMENT_PI_DATA = "RETURN_ELEMENT_PI_DATA";

    public static RETURN_DRESS_AVATAR_IDS = "RETURN_DRESS_AVATAR_IDS";// 返回当前装备的装扮
    public static RETURN_UPDATE_RED_SYSTEM = "RETURN_UPDATE_RED_SYSTEM";// 红点系统协议更新
    /**
     * 发送新的Proto对接协议
     */
    public static SEND_NEW_PROTO_MESSAGE = "SEND_NEW_PROTO_MESSAGE";
    /**
     * 背包喇叭数量更新
     */
    public static PACKAGE_TRUMPET_COUNT_UPDATE = "PACKAGE_TRUMPET_COUNT_UPDATE";
    /**
     * 请求回到玩家房间
     */
    public static REQUEST_GO_PLAYER_HOME = "REQUEST_GO_PLAYER_HOME";
    /**
     * 请求去某个房间或场景
     */
    public static REQUEST_GO_ROOM_SCENE = "REQUEST_GO_ROOM_SCENE";
    /**
     * 请求返回矿洞准备层
     */
    public static REQUEST_GO_MINE_READY = "REQUEST_GO_MINE_READY";
}
