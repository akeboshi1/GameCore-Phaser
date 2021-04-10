import { Handler, i18n } from "utils";

export class TimerCountDown {

    private timerid: any;
    private callback: Handler;
    private interval: number;
    constructor(callback: Handler) {
        this.callback = callback;
    }
    public execute(interval: number) {
        this.clear();
        this.interval = interval;
        const timeout = () => {
            const text = this.getDataFormat(this.interval * 1000);
            if (this.callback) this.callback.runWith([this.interval, text]);
            if (this.interval > 0) {
                this.timerid = setTimeout(() => {
                    this.interval -= 1;
                    timeout();
                }, 1000);
            } else {
                this.timerid = undefined;
            }
        };
        timeout();
    }
    public clear() {
        if (this.timerid) clearTimeout(this.timerid);
        this.timerid = undefined;
    }
    private getDataFormat(time: number) {
        const day = Math.floor(time / 86400000);
        const hour = Math.floor(time / 3600000) % 24;
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let text = "";
        if (day > 0) {
            text = `${day} ${i18n.t("timeuint.day")} ${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
        } else if (hour > 0 || minute > 0 || second > 0) {
            text = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
        }
        return text;
    }
    private stringFormat(num: number) {
        let str = num + "";
        if (str.length <= 1) {
            str = "0" + str;
        }
        return str;
    }
}
