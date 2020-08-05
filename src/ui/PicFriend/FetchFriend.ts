import { WorldService } from "../../game/world.service";
import { HttpService } from "../../net/http.service";

export class FetchFriend {
    private httpService: HttpService;
    private userId: string;
    constructor(worldService: WorldService) {
        this.httpService = worldService.httpService;
        this.userId = worldService.getConfig().user_id || "5f228eca28884d186ca2d542";
    }

    getFolloweds() {
        return this.httpService.get(`user/${this.userId}/followeds`);
    }

    getFans() {
        return this.httpService.get(`user/${this.userId}/fans`);
    }

    getBanlist() {
        return this.httpService.get(`user/banlist`);
    }

    getFriends() {
        return this.httpService.get(`user/friends`);
    }
}
