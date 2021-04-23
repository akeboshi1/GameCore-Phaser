export interface FriendRelation {
    id: string;
    relation: FriendRelationEnum;
}
export declare enum FriendRelationEnum {
    Null = "null",
    Friend = "friend",
    Fans = "fans",
    Followed = "followed",
    Blacklist = "blacklist"
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
}
export declare enum FriendChannel {
    Friends = 0,
    Fans = 1,
    Followes = 2,
    Blacklist = 3,
    Search = 4,
    Menu = 5,
    Notice = 6,
    Null = 7
}
