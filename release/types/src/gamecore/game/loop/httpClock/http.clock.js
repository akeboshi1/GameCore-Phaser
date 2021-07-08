import { i18n, Logger } from "structure";
/**
 * 每5min发送一次心跳包
 */
var HttpClock = /** @class */ (function () {
    function HttpClock(game) {
        this.game = game;
        // private readonly interval = 300000;
        this.interval = 60000;
        this.mTimestamp = 0;
        this.mEnable = false;
        this.httpService = game.httpService;
        this.gameId = game.getGameConfig().game_id;
    }
    HttpClock.prototype.update = function (time, delta) {
        if (this.mTimestamp > this.interval) {
            this.sync();
            this.mTimestamp = 0;
        }
        this.mTimestamp += delta;
    };
    HttpClock.prototype.allowLogin = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetch().then(function (response) {
                var code = response.code, data = response.data;
                if (code === 0) {
                    if (!_this.allowedPeriod(data, callback)) {
                        resolve(false);
                        return;
                    }
                    if (!_this.checkTimeAllowed(data, callback)) {
                        resolve(false);
                        return;
                    }
                    resolve(true);
                }
            }).catch(function (error) {
                Logger.getInstance().error(error);
            });
        });
    };
    HttpClock.prototype.fetch = function () {
        return this.httpService.playedDuration("831dab", this.mGameId);
    };
    HttpClock.prototype.sync = function () {
        var _this = this;
        this.fetch().then(function (response) {
            if (_this.mEnable === false) {
                return;
            }
            var code = response.code, data = response.data;
            if (code === 0) {
                if (!_this.checkTimeAllowed(data) || !_this.allowedPeriod(data)) {
                    _this.game.peer.closeConnect(true);
                }
            }
        }).catch(function (errorTxt) {
            Logger.getInstance().error(errorTxt);
        });
    };
    HttpClock.prototype.allowedPeriod = function (data, callback) {
        if (data.in_allowed_period) {
            return true;
        }
        this.showAlert("[color=#ff0000][size=" + 14 * this.game.getGameConfig().ui_scale + "]\u60A8\u7684\u8D26\u53F7\u5C5E\u4E8E\u672A\u6210\u5E74\u4EBA[/size][/color]\n\u6BCF\u65E522:00~\u6B21\u65E58:00\u662F\u4F11\u606F\u65F6\u95F4\uFF0C\u6839\u636E\u76F8\u5173\u89C4\u5B9A\uFF0C\u8BE5\u65F6\u95F4\u4E0D\u53EF\u767B\u5F55\u6E38\u620F\uFF0C\u8BF7\u6CE8\u610F\u4F11\u606F\u54E6\uFF01", callback);
        return false;
    };
    HttpClock.prototype.checkTimeAllowed = function (data, callback) {
        if (data.time_played >= data.max_time_allowed) {
            this.showAlert("[color=#ff0000][size=" + 14 * this.game.getGameConfig().ui_scale + "]\u60A8\u7684\u8D26\u53F7\u5C5E\u4E8E\u672A\u6210\u5E74\u4EBA[/size][/color]\n\u4ECA\u65E5\u7D2F\u8BA1\u65F6\u957F\u5DF2\u8D85\u8FC7" + (data.max_time_allowed / 3600).toFixed(1) + "\u5C0F\u65F6\uFF01\n\u4E0D\u53EF\u767B\u5F55", callback);
            return false;
        }
        return true;
    };
    HttpClock.prototype.showAlert = function (text, callback) {
        this.game.peer.render.showAlert(text, i18n.t("common.tips"));
    };
    Object.defineProperty(HttpClock.prototype, "enable", {
        set: function (val) {
            this.mEnable = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpClock.prototype, "gameId", {
        set: function (val) {
            var gameId = val;
            var index = val.lastIndexOf(".");
            if (index > -1) {
                gameId = gameId.slice(index + 1, gameId.length);
            }
            this.mGameId = gameId;
            this.sync();
        },
        enumerable: true,
        configurable: true
    });
    return HttpClock;
}());
export { HttpClock };
//# sourceMappingURL=http.clock.js.map