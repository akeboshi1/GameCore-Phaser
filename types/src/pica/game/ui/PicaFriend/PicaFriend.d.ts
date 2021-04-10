import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaFriend extends BasicModel {
    private httpService;
    private userId;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    fetchFriendInfo(id: string): void;
    fetchFriendList(ids: string[]): void;
    searchFriend(name: string): void;
    getFolloweds(): Promise<any>;
    getFans(): Promise<any>;
    getBanlist(): Promise<any>;
    getFriends(): Promise<any>;
    get connection(): ConnectionService;
    private onPlayerListHandler;
    private onSearchHandler;
}
