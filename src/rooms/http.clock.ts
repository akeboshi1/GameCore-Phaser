import { HttpService } from "../net/http.service";
import { WorldService } from "../game/world.service";
import { AlertView, Buttons } from "../ui/components/alert.view";

/**
 * 每5min发送一次心跳包
 */
export class HttpClock {
    // private readonly interval = 300000;
    private readonly interval = 60000;
    private mTimestamp: number = 0;
    private httpService: HttpService;
    private mEnable: boolean = false;
    constructor(private world: WorldService) {
        this.httpService = world.httpService;
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
        return this.world.httpService.playedDuration("831dabefd919aa6259c25f9322fa57b88050d526", this.world.getConfig().game_id);
    }

    sync() {
        this.fetch().then((response: any) => {
            const { code, data } = response;
            if (code === 0) {
                if (!this.checkTimeAllowed(data) || !this.allowedPeriod(data)) {
                    this.world.connection.closeConnect();
                }
            }
        });
    }

    private allowedPeriod(data: any, callback?: () => void) {
        if (data.in_allowed_period) {
            return true;
        }
        this.showAlert(`[color=#ff0000][size=${16 * this.world.uiRatio}]您的账号属于未成年[/size][/color]\n每日22:00~次日8:00是休息时间，根据相关规定，该时间不可登录游戏，请注意休息哦！`, callback);
        return false;
    }

    private checkTimeAllowed(data: any, callback?: () => void) {
        if (data.time_played >= data.max_time_allowed) {
            this.showAlert(`[color=#ff0000][size=${16 * this.world.uiRatio}]您的账号属于未成年[/size][/color]\n今日累计时长已超过${(data.time_played / 3600).toFixed(1)}小时！`, callback);
            return false;
        }
        return true;
    }

    private showAlert(text: string, callback?: () => void) {
        const uiLayer = this.world.uiManager.getUILayerManager();
        new AlertView(uiLayer.scene, this.world).show({
            text,
            callback,
            btns: Buttons.Ok,
            title: "提示"
        });
    }

    set enable(val: boolean) {
        this.mEnable = val;
    }
}
