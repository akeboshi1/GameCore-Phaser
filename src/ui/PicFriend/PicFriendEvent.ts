export namespace PicFriendEvent {
    /**
     * 请求好友、关注、粉丝数据
     */
    export const FETCH_FRIEND: string = "fetchFriend";

    /**
     * 关注
     */
    export const FOLLOW: string = "follow";

    /**
     * 取消关注
     */
    export const UNFOLLOW: string = "unfollow";

    /**
     * 添加黑名单
     */
    export const BanUser: string = "banUser";

    /**
     * 移除黑名单
     */
    export const REMOVE_BAN_USER: string = "removeBanUser";

    /**
     * 请求黑名单
     */
    export const REQ_BLACKLIST: string = "ReqBlacklist";

    /**
     * 请求好友属性，并打开好友属性面板
     */
    export const REQ_FRIEND_ATTRIBUTES: string = "reqFriendAttributes";

    /**
     * 请求好友游戏数据
     */
    export const REQ_FRIEND_GAME_DATA: string = "reqFriendGameData";

    /**
     * 从黑名单移除
     */
    export const REMOVE_FROM_BLACKLIST: string = "removeFromBlacklist";

    /**
     * renderer emit event
     */
    export const RENDERER_EVENT: string = "rendererEvent";
}
