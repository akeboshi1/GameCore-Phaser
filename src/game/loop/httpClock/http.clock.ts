import { i18n } from "../../../utils/i18n";
import { Game } from "../../game";
import { HttpService } from "./http.service";

/**
 * 每5min发送一次心跳包
 */
export class HttpClock {
    // private readonly interval = 300000;
    private readonly interval = 60000;
    private mTimestamp: number = 0;
    private httpService: HttpService;
    private mEnable: boolean = false;
    constructor(private game: Game) {
        this.httpService = game.httpService;
    }

    update(time: number, delta: number) {
        if (this.mEnable === false) {
            return;
        }
        if (this.mTimestamp > this.interval) {
            this.sync();
            this.mTimestamp = 0;
        }
        this.mTimestamp += delta;
    }

    allowLogin(callback: () => void) {
        return new Promise((resolve, reject) => {
            this.fetch().then((response: any) => {
                const { code, data } = response;
                if (code === 0) {
                    if (!this.allowedPeriod(data, callback)) {
                        resolve(false);
                        return;
                    }
                    if (!this.checkTimeAllowed(data, callback)) {
                        resolve(false);
                        return;
                    }
                    resolve(true);
                }
            });
        });
    }

    fetch() {
        return this.httpService.playedDuration("831dabefd919aa6259c25f9322fa57b88050d526", this.game.getGameConfig().game_id);
    }

    sync() {
        this.fetch().then((response: any) => {
            const { code, data } = response;
            if (code === 0) {
                if (!this.checkTimeAllowed(data) || !this.allowedPeriod(data)) {
                    this.game.peer.closeConnect();
                }
            }
        });
    }

    private allowedPeriod(data: any, callback?: () => void) {
        if (data.in_allowed_period) {
            return true;
        }
        this.showAlert(`[color=#ff0000][size=${14 * this.game.getGameConfig().ui_scale}]您的账号属于未成年人[/size][/color]\n每日22:00~次日8:00是休息时间，根据相关规定，该时间不可登录游戏，请注意休息哦！`, callback);
        return false;
    }

    private checkTimeAllowed(data: any, callback?: () => void) {
        if (data.time_played >= data.max_time_allowed) {
            this.showAlert(`[color=#ff0000][size=${14 * this.game.getGameConfig().ui_scale}]您的账号属于未成年人[/size][/color]\n今日累计时长已超过${(data.max_time_allowed / 3600).toFixed(1)}小时！\n不可登录`, callback);
            return false;
        }
        return true;
    }

    private showAlert(text: string, callback?: () => void) {
        this.game.peer.render.showAlert(text, i18n.t("common.tips"));
    }

    set enable(val: boolean) {
        this.mEnable = val;
    }
}
