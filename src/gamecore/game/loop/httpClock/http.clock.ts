import { Game } from "../../game";
import { HttpService } from "./http.service";

/**
 * 每5min发送一次心跳包
 */
export class HttpClock {
    // private readonly interval = 300000;
    protected readonly interval = 60000;
    protected mTimestamp: number = 0;
    protected httpService: HttpService;
    protected mGameId: string;
    constructor(protected game: Game) {
        this.httpService = game.httpService;
        this.gameId = game.getGameConfig().game_id;
    }

    update(time: number, delta: number) {
        if (this.mTimestamp > this.interval) {
            this.sync();
            this.mTimestamp = 0;
        }
        this.mTimestamp += delta;
    }

    fetch() {
        return this.httpService.playedDuration("831dab", this.mGameId);
    }

    sync() {
        this.fetch();
    }

    set gameId(val: string) {
        let gameId = val;
        if (!val) return;
        const index = val.lastIndexOf(".");
        if (index > -1) {
            gameId = gameId.slice(index + 1, gameId.length);
        }
        this.mGameId = gameId;
        this.sync();
    }
}
