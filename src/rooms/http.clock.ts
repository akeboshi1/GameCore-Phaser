import { HttpService } from "../net/http.service";
import { WorldService } from "../game/world.service";

/**
 * 每5min发送一次心跳包
 */
export class HttpClock {
    // private readonly interval = 300000;
    private readonly interval = 60000;
    private mTimestamp: number = 0;
    private httpService: HttpService;
    constructor(private world: WorldService) {
        this.httpService = world.httpService;
    }

    update(time: number, delta: number) {
        if (this.mTimestamp > this.interval) {
            this.sync();
            this.mTimestamp = 0;
        }
        this.mTimestamp += delta;
    }

    public sync() {
        if (!this.world.httpService) {
            return;
        }
        this.world.httpService.playedDuration("831dabefd919aa6259c25f9322fa57b88050d526", this.world.getConfig().game_id);
    }
}
