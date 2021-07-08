import { i18n } from "./i18n";
var TimerCountDown = /** @class */ (function () {
    function TimerCountDown(callback) {
        this.callback = callback;
    }
    TimerCountDown.prototype.executeText = function (interval) {
        var _this = this;
        this.clear();
        this.interval = interval;
        var timeout = function () {
            var text = _this.getDataFormat(_this.interval * 1000);
            if (_this.callback)
                _this.callback.runWith([_this.interval, text]);
            if (_this.interval > 0) {
                _this.timerid = setTimeout(function () {
                    _this.interval -= 1;
                    timeout();
                }, 1000);
            }
            else {
                _this.timerid = undefined;
            }
        };
        timeout();
    };
    TimerCountDown.prototype.executeTime = function (interval) {
        var _this = this;
        this.clear();
        this.interval = interval;
        var timeout = function () {
            if (_this.callback)
                _this.callback.runWith([_this.interval]);
            if (_this.interval > 0) {
                _this.timerid = setTimeout(function () {
                    _this.interval -= 1;
                    timeout();
                }, 1000);
            }
            else {
                _this.timerid = undefined;
            }
        };
        timeout();
    };
    TimerCountDown.prototype.clear = function () {
        if (this.timerid)
            clearTimeout(this.timerid);
        this.timerid = undefined;
    };
    TimerCountDown.prototype.getDataFormat = function (time) {
        var day = Math.floor(time / 86400000);
        var hour = Math.floor(time / 3600000) % 24;
        var minute = Math.floor(time / 60000) % 60;
        var second = Math.floor(time / 1000) % 60;
        var text = "";
        if (day > 0) {
            text = day + " " + i18n.t("timeuint.day") + " " + this.stringFormat(hour) + ":" + this.stringFormat(minute) + ":" + this.stringFormat(second);
        }
        else if (hour > 0 || minute > 0 || second > 0) {
            text = this.stringFormat(hour) + ":" + this.stringFormat(minute) + ":" + this.stringFormat(second);
        }
        return text;
    };
    TimerCountDown.prototype.stringFormat = function (num) {
        var str = num + "";
        if (str.length <= 1) {
            str = "0" + str;
        }
        return str;
    };
    return TimerCountDown;
}());
export { TimerCountDown };
//# sourceMappingURL=TimerCountDown.js.map