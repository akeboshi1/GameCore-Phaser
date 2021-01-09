import { i18n } from "utils";

export class TimeUtils {

    static getDataFormat(time: number, haveday: boolean, color?: string) {
        const day = haveday ? Math.floor(time / 86400000) : 0;
        const hour = haveday ? Math.floor(time / 3600000) % 24 : Math.floor(time / 3600000);
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let text = "";
        let temptime = "";
        if (day > 0) {
            temptime = `${day}-${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
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
}
