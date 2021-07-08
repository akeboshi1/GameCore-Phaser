export var FriendRelationEnum;
(function (FriendRelationEnum) {
    FriendRelationEnum["Null"] = "null";
    FriendRelationEnum["Friend"] = "friend";
    FriendRelationEnum["Fans"] = "fans";
    FriendRelationEnum["Followed"] = "followed";
    FriendRelationEnum["Blacklist"] = "blacklist";
})(FriendRelationEnum || (FriendRelationEnum = {}));
export var FriendRelationAction;
(function (FriendRelationAction) {
    FriendRelationAction["FRIEND"] = "FRIEND";
    FriendRelationAction["FOLLOW"] = "FOLLOW";
    FriendRelationAction["UNFOLLOW"] = "UNFOLLOW";
    FriendRelationAction["BAN"] = "BAN";
    FriendRelationAction["UNBAN"] = "UNBAN";
})(FriendRelationAction || (FriendRelationAction = {}));
export var FriendChannel;
(function (FriendChannel) {
    FriendChannel[FriendChannel["Friends"] = 0] = "Friends";
    FriendChannel[FriendChannel["Fans"] = 1] = "Fans";
    FriendChannel[FriendChannel["Followes"] = 2] = "Followes";
    FriendChannel[FriendChannel["Blacklist"] = 3] = "Blacklist";
    FriendChannel[FriendChannel["Search"] = 4] = "Search";
    FriendChannel[FriendChannel["Menu"] = 5] = "Menu";
    FriendChannel[FriendChannel["Notice"] = 6] = "Notice";
    FriendChannel[FriendChannel["Null"] = 7] = "Null";
})(FriendChannel || (FriendChannel = {}));
//# sourceMappingURL=friend.relation.js.map