import { World } from "../../game";

export class Friend {
    private mFriendList: any[];
    constructor(private world: World) {
        this.mFriendList = [];
    }

    public requestFriend(callBack?: Function) {
        const func: Function = callBack;
        this.world.httpService.firend().then((response) => {
            if (response.code === 200) {
                if (func) func(response.data);
            }
        });
    }

    public friendList(): any[] {
        return this.mFriendList || [];
    }

}
