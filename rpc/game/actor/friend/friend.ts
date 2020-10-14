import { Game } from "../../game";

export class Friend {
    private mFriendList: any[];
    constructor(private game: Game) {
        this.mFriendList = [];
    }

    public requestFriend(callBack?: Function) {
        const func: Function = callBack;
        this.game.httpService.firend().then((response) => {
            if (response.code === 200) {
                if (func) func(response.data);
            }
        });
    }

    public friendList(): any[] {
        return this.mFriendList || [];
    }

}
