var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { i18n } from "./i18n";
export class TimerCountDown {
  constructor(callback) {
    __publicField(this, "timerid");
    __publicField(this, "callback");
    __publicField(this, "interval");
    this.callback = callback;
  }
  executeText(interval) {
    this.clear();
    this.interval = interval;
    const timeout = () => {
      const text = this.getDataFormat(this.interval * 1e3);
      if (this.callback)
        this.callback.runWith([this.interval, text]);
      if (this.interval > 0) {
        this.timerid = setTimeout(() => {
          this.interval -= 1;
          timeout();
        }, 1e3);
      } else {
        this.timerid = void 0;
      }
    };
    timeout();
  }
  executeTime(interval) {
    this.clear();
    this.interval = interval;
    const timeout = () => {
      if (this.callback)
        this.callback.runWith([this.interval]);
      if (this.interval > 0) {
        this.timerid = setTimeout(() => {
          this.interval -= 1;
          timeout();
        }, 1e3);
      } else {
        this.timerid = void 0;
      }
    };
    timeout();
  }
  clear() {
    if (this.timerid)
      clearTimeout(this.timerid);
    this.timerid = void 0;
  }
  getDataFormat(time) {
    const day = Math.floor(time / 864e5);
    const hour = Math.floor(time / 36e5) % 24;
    const minute = Math.floor(time / 6e4) % 60;
    const second = Math.floor(time / 1e3) % 60;
    let text = "";
    if (day > 0) {
      text = `${day} ${i18n.t("timeuint.day")} ${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
    } else if (hour > 0 || minute > 0 || second > 0) {
      text = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
    }
    return text;
  }
  stringFormat(num) {
    let str = num + "";
    if (str.length <= 1) {
      str = "0" + str;
    }
    return str;
  }
}
