export class EventType {
    // ============== worker event name
    public static PACKAGE_SYNC_FINISH = "PACKAGE_SYNC_FINISH";// 同步背包完成
    public static PACKAGE_UPDATE = "PACKAGE_UPDATE"; // 背包更新
    public static UPDATE_PLAYER_INFO = "UPDATE_PLAYER_INFO"; // 更新玩家数据
    public static UPDATE_ROOM_INFO = "UPDATE_ROOM_INFO"; // 更新房间信息
    public static UPDATE_PARTY_STATE = "UPDATE_PARTY_STATE"; // 刷新派对状态
    public static SEND_FURNITURE_REQUIREMENTS = "SEND_FURNITURE_REQUIREMENTS"; // 家具冻结修复材料
    public static QUERY_MARKET = "QUERY_MARKET"; // 刷新市场数据
    public static CHAT = "CHAT"; // 聊天
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
    public static PANEL_INIT = "PANEL_INIT";
    public static SHOW_MED = "SHOW_MED";
    public static QUERY_PRAISE = "QUERY_PRAISE";
    public static QUERY_MARKET_REQUEST = "QUERY_MARKET_REQUEST";
}
