import { i18n } from "./i18n";

export class TimeUtils {

    static getDateFormat(time: number, haveday: boolean, color?: string) {
        const day = haveday ? Math.floor(time / 86400000) : 0;
        const hour = haveday ? Math.floor(time / 3600000) % 24 : Math.floor(time / 3600000);
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let text = "";
        let temptime = "";
        if (day > 0) {
            temptime = `${day}${i18n.t("timeuint.day")}${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
        } else if (hour > 0 || minute > 0 || second > 0) {
            temptime = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
        } else {
            temptime = `${i18n.t("furni_bag.expires")}`;
        }
        text += color ? `[color=#FF0000]${temptime}[/color]` : temptime;
        return text;
    }
    static stringFormat(num: number) {
        let str = num + "";
        if (str.length <= 1) {
            str = "0" + str;
        }
        return str;
    }
    static getBriefFormat(time: number) {
        const day = Math.floor(time / 86400000);
        const hour = Math.floor(time / 3600000) % 24;
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let temptime = "";
        if (day > 0) {
            temptime = `${day}${i18n.t("timeuint.day")}${this.stringFormat(hour)}${i18n.t("timeuint.hour")}`;
        } else if (hour > 0) {
            temptime = `${this.stringFormat(hour)}${i18n.t("timeuint.hour")}${this.stringFormat(minute)}${i18n.t("timeuint.minutes")}`;
        } else if (minute > 0 || second > 0) {
            temptime = `${this.stringFormat(minute)}${i18n.t("timeuint.minutes")}${this.stringFormat(second)}${i18n.t("timeuint.second")}`;
        } else {
            temptime = `${this.stringFormat(second)}${i18n.t("timeuint.second")}`;
        }
        return temptime;
    }
    static dateFormat(fmt: string, date: Date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (const k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
            }
        }
        return fmt;
    }
}
