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
    // ============== render event name
    public static SHOW_MED = "SHOW_MED";
    public static QUERY_PRAISE = "QUERY_PRAISE";
    public static QUERY_MARKET_REQUEST = "QUERY_MARKET_REQUEST";
}
