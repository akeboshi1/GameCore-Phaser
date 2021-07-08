var EventType = /** @class */ (function () {
    function EventType() {
    }
    // ============== worker event name
    EventType.PACKAGE_SYNC_FINISH = "PACKAGE_SYNC_FINISH"; // 同步背包完成
    EventType.PACKAGE_UPDATE = "PACKAGE_UPDATE"; // 背包更新
    EventType.UPDATE_PLAYER_INFO = "UPDATE_PLAYER_INFO"; // 更新玩家数据
    EventType.UPDATE_ROOM_INFO = "UPDATE_ROOM_INFO"; // 更新房间信息
    EventType.UPDATE_EXTRA_ROOM_INFO = "UPDATE_EXTRA_ROOM_INFO"; // 更新额外房间信息
    EventType.UPDATE_PARTY_STATE = "UPDATE_PARTY_STATE"; // 刷新派对状态
    EventType.SEND_FURNITURE_REQUIREMENTS = "SEND_FURNITURE_REQUIREMENTS"; // 家具冻结修复材料
    EventType.SCENE_ELEMENT_DATA_UPDATE = "SCENE_ELEMENT_DATA_UPDATE"; // 场景元素数据刷新
    EventType.QUERY_MARKET = "QUERY_MARKET"; // 刷新市场数据
    EventType.CHAT = "CHAT"; // 聊天
    EventType.SCENE_POINT_ELEMENT = "SCENE_ELEMENT"; // 点击的场景元素
    EventType.SCENE_SHOW_UI = "SCENE_SHOW_UI"; // 点击场景元素显示UI;
    EventType.ELEMENT_ITEM_CONFIG = "ELEMENT_ITEM_CONFIG"; // 场景元素和道具配置请求
    EventType.SEND_GIFT_DATA_UPDATE = "SEND_GIFT_DATA_UPDATE"; // 派对赠送礼物数据
    EventType.SCENE_ELEMENT_FIND = "SCENE_ELEMENT_FIND"; // 场景元素查找
    EventType.SCENE_RETURN_FIND_ELEMENT = "SCENE_RETURN_FIND_ELEMENT"; // 返回查找的场景元素
    EventType.SCENE_PLAYER_FIND = "SCENE_PLAYER_FIND"; // 场景玩家查找
    EventType.SCENE_RETURN_FIND_PLAYER = "SCENE_RETURN_FIND_PLAYER"; // 返回查找的场景玩家
    EventType.SCENE_INTERACTION_ELEMENT = "SCENE_INTERACTION_ELEMENT"; // 场景交互元素
    EventType.SCENE_PLAYER_ACTION = "SCENE_PLAYER_ACTION"; // 场景玩家执行行为动作
    EventType.SCENE_SHOW_MAIN_UI = "SCENE_SHOW_MAIN_UI"; // 显示场景主界面
    EventType.CHAT_PANEL_EXTPAND = "CHAT_PANEL_EXTPAND"; // 聊天面板展开
    EventType.SCENE_CHANGE = "SCENE_CHANGE"; // 切换场景
    EventType.QUERY_SURVEY_FURNITURE = "QUERY_SURVEY_FURNITURE"; // 请求调查家具
    EventType.ENTER_SURVEY_FURNITURE_STATUSE = "ENTER_SURVEY_FURNITURE_STATUSE"; // 进入家具调查状态
    EventType.EXECUTE_SURVEY_FURNITURE = "EXECUTE_SURVEY_FURNITURE"; // TEMP: 执行调查家具
    EventType.FECTH_FOLD_MAIN_UI = "FECTH_FOLD_MAIN_UI"; // 请求折叠主界面
    /**
     * 请求好友、关注、粉丝数据
     */
    EventType.FETCH_FRIEND = "fetchFriend";
    /**
     * 关注
     */
    EventType.FOLLOW = "follow";
    /**
     * 取消关注
     */
    EventType.UNFOLLOW = "unfollow";
    /**
     * 移除黑名单
     */
    EventType.REMOVE_BAN_USER = "removeBanUser";
    /**
     * 请求黑名单
     */
    EventType.REQ_BLACKLIST = "ReqBlacklist";
    /**
     * 请求好友属性，并打开好友属性面板
     */
    EventType.REQ_FRIEND_ATTRIBUTES = "reqFriendAttributes";
    /**
     * 请求好友游戏数据
     */
    EventType.REQ_FRIEND_GAME_DATA = "reqFriendGameData";
    /**
     * 从黑名单移除
     */
    EventType.REMOVE_FROM_BLACKLIST = "removeFromBlacklist";
    /**
     * renderer emit event
     */
    EventType.RENDERER_EVENT = "rendererEvent";
    /**
     * 请求游戏好友
     */
    EventType.REQ_PLAYER_LIST = "reqPlayerList";
    /**
     * 游戏好友列表
     */
    EventType.PLAYER_LIST = "playerList";
    /**
     * 搜索好友
     */
    EventType.SEARCH_FRIEND = "searchFriend";
    /**
     * Server返回的搜索结果
     */
    EventType.SEARCH_RESULT = "searchResult";
    /**
     * 请求好友关系
     */
    EventType.REQ_FRIEND_RELATION = "reqFriendRelation";
    /**
     * 请求好友关系
     */
    EventType.REQ_RELATION = "reqRelation";
    /**
     * 请求新增粉丝
     */
    EventType.REQ_NEW_FANS = "reqNewFans";
    // ============== render event name
    EventType.SHOW_MED = "SHOW_MED";
    EventType.QUERY_PRAISE = "QUERY_PRAISE";
    EventType.QUERY_MARKET_REQUEST = "QUERY_MARKET_REQUEST";
    EventType.REQUEST_TARGET_UI = "REQUEST_TARGET_UI";
    /**
     * navigate初始化好，修改PlayCamera大小
     */
    EventType.NAVIGATE_RESIZE = "navigateResize";
    /**
     * 命令协议测试
     */
    EventType.TEST_COMMAND_MESSAGE = "TEST_COMMAND_MESSAGE";
    /**
     * 图鉴数据更新
     */
    EventType.GALLERY_UPDATE = "GALLERY_UPDATE";
    EventType.DONE_MISSION_LIST = "DONE_MISSION_LIST"; // 收集奖励领取
    /**
     * 请求家具PI数据
     */
    EventType.QUEST_ELEMENT_PI_DATA = "QUEST_ELEMENT_PI_DATA";
    /**
     * 返回家具PI数据
     */
    EventType.RETURN_ELEMENT_PI_DATA = "RETURN_ELEMENT_PI_DATA";
    EventType.RETURN_DRESS_AVATAR_IDS = "RETURN_DRESS_AVATAR_IDS"; // 返回当前装备的装扮
    EventType.RETURN_UPDATE_RED_SYSTEM = "RETURN_UPDATE_RED_SYSTEM"; // 红点系统协议更新
    /**
     * 发送新的Proto对接协议
     */
    EventType.SEND_NEW_PROTO_MESSAGE = "SEND_NEW_PROTO_MESSAGE";
    /**
     * 背包喇叭数量更新
     */
    EventType.PACKAGE_TRUMPET_COUNT_UPDATE = "PACKAGE_TRUMPET_COUNT_UPDATE";
    /**
     * 请求回到玩家房间
     */
    EventType.REQUEST_GO_PLAYER_HOME = "REQUEST_GO_PLAYER_HOME";
    /**
     * 请求去某个房间或场景
     */
    EventType.REQUEST_GO_ROOM_SCENE = "REQUEST_GO_ROOM_SCENE";
    /**
     * 请求返回矿洞准备层
     */
    EventType.REQUEST_GO_MINE_READY = "REQUEST_GO_MINE_READY";
    return EventType;
}());
export { EventType };
//# sourceMappingURL=event.type.js.map