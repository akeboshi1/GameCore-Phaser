import { FriendRelation, FriendRelationEnum } from "structure";

export class PicFriendRelation {
    static check(me: string, cid: string, data: any[]): FriendRelation {
        let relation = FriendRelationEnum.Null;
        if (data.length > 0) {
            const isBan = data[0].ban;
            if (isBan) {
                return { id: cid, relation: FriendRelationEnum.Blacklist};
            }
            if (data[0].followed_user === cid) {
                relation = FriendRelationEnum.Followed;
            } else if (data[0].followed_user === me) {
                relation = FriendRelationEnum.Fans;
            }
            if (data.length >= 2) {
                if (data[0].user === data[1].followed_user && data[1].followed_user === data[0].user) {
                    relation = FriendRelationEnum.Friend;
                }
            }
        }
        return { id: cid, relation };
    }
}
