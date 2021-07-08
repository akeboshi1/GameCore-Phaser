import { i18n } from "./i18n";
var TimeUtils = /** @class */ (function () {
    function TimeUtils() {
    }
    TimeUtils.getDateFormat = function (time, haveday, color) {
        var day = haveday ? Math.floor(time / 86400000) : 0;
        var hour = haveday ? Math.floor(time / 3600000) % 24 : Math.floor(time / 3600000);
        var minute = Math.floor(time / 60000) % 60;
        var second = Math.floor(time / 1000) % 60;
        var text = "";
        var temptime = "";
        if (day > 0) {
            temptime = "" + day + i18n.t("timeuint.day") + this.stringFormat(hour) + ":" + this.stringFormat(minute) + ":" + this.stringFormat(second);
        }
        else if (hour > 0 || minute > 0 || second > 0) {
            temptime = this.stringFormat(hour) + ":" + this.stringFormat(minute) + ":" + this.stringFormat(second);
        }
        else {
            temptime = "" + i18n.t("furni_bag.expires");
        }
        text += color ? "[color=#FF0000]" + temptime + "[/color]" : temptime;
        return text;
    };
    TimeUtils.stringFormat = function (num) {
        var str = num + "";
        if (str.length <= 1) {
            str = "0" + str;
        }
        return str;
    };
    TimeUtils.getBriefFormat = function (time) {
        var day = Math.floor(time / 86400000);
        var hour = Math.floor(time / 3600000) % 24;
        var minute = Math.floor(time / 60000) % 60;
        var second = Math.floor(time / 1000) % 60;
        var temptime = "";
        if (day > 0) {
            temptime = "" + day + i18n.t("timeuint.day") + this.stringFormat(hour) + i18n.t("timeuint.hour");
        }
        else if (hour > 0) {
            temptime = "" + this.stringFormat(hour) + i18n.t("timeuint.hour") + this.stringFormat(minute) + i18n.t("timeuint.minutes");
        }
        else if (minute > 0 || second > 0) {
            temptime = "" + this.stringFormat(minute) + i18n.t("timeuint.minutes") + this.stringFormat(second) + i18n.t("timeuint.second");
        }
        else {
            temptime = "" + this.stringFormat(second) + i18n.t("timeuint.second");
        }
        return temptime;
    };
    TimeUtils.dateFormat = function (fmt, date) {
        var ret;
        var opt = {
            "Y+": date.getFullYear().toString(),
            "m+": (date.getMonth() + 1).toString(),
            "d+": date.getDate().toString(),
            "H+": date.getHours().toString(),
            "M+": date.getMinutes().toString(),
            "S+": date.getSeconds().toString() // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (var k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
            }
        }
        return fmt;
    };
    return TimeUtils;
}());
export { TimeUtils };
//# sourceMappingURL=time.utils.js.map