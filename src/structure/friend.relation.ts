export interface FriendRelation {
    id: string;
    relation: FriendRelationEnum;
}

export enum FriendRelationEnum {
    Null = "null",
    Friend = "friend",
    Fans = "fans",
    Followed = "followed",
    Blacklist = "blacklist",
}
export enum FriendRelationAction {
    FOLLOW = "FOLLOW",
    UNFOLLOW = "UNFOLLOW",
    BAN = "BAN",
    UNBAN = "UNBAN"
}
export interface MenuData {
    type: FriendChannel;
}

export interface FriendData {
    type: FriendChannel;
    id?: string;
    lv?: number;
    online?: boolean;
    nickname?: string;
    username?: string;
    menuData?: MenuData;
    createAt?: number;
    relation?: FriendRelationEnum;
    avatar?: string;
    genger?: number;

}

export enum FriendChannel {
    Friends,
    Fans,
    Followes,
    Blacklist,
    Search,
    Menu,
    Notice,
    Null
}
