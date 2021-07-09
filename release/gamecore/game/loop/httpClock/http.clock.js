var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { i18n, Logger } from "structure";
export class HttpClock {
  constructor(game) {
    this.game = game;
    __publicField(this, "interval", 6e4);
    __publicField(this, "mTimestamp", 0);
    __publicField(this, "httpService");
    __publicField(this, "mEnable", false);
    __publicField(this, "mGameId");
    this.httpService = game.httpService;
    this.gameId = game.getGameConfig().game_id;
  }
  update(time, delta) {
    if (this.mTimestamp > this.interval) {
      this.sync();
      this.mTimestamp = 0;
    }
    this.mTimestamp += delta;
  }
  allowLogin(callback) {
    return new Promise((resolve, reject) => {
      this.fetch().then((response) => {
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
      }).catch((error) => {
        Logger.getInstance().error(error);
      });
    });
  }
  fetch() {
    return this.httpService.playedDuration("831dab", this.mGameId);
  }
  sync() {
    this.fetch().then((response) => {
      if (this.mEnable === false) {
        return;
      }
      const { code, data } = response;
      if (code === 0) {
        if (!this.checkTimeAllowed(data) || !this.allowedPeriod(data)) {
          this.game.peer.closeConnect(true);
        }
      }
    }).catch((errorTxt) => {
      Logger.getInstance().error(errorTxt);
    });
  }
  allowedPeriod(data, callback) {
    if (data.in_allowed_period) {
      return true;
    }
    this.showAlert(`[color=#ff0000][size=${14 * this.game.getGameConfig().ui_scale}]\u60A8\u7684\u8D26\u53F7\u5C5E\u4E8E\u672A\u6210\u5E74\u4EBA[/size][/color]
\u6BCF\u65E522:00~\u6B21\u65E58:00\u662F\u4F11\u606F\u65F6\u95F4\uFF0C\u6839\u636E\u76F8\u5173\u89C4\u5B9A\uFF0C\u8BE5\u65F6\u95F4\u4E0D\u53EF\u767B\u5F55\u6E38\u620F\uFF0C\u8BF7\u6CE8\u610F\u4F11\u606F\u54E6\uFF01`, callback);
    return false;
  }
  checkTimeAllowed(data, callback) {
    if (data.time_played >= data.max_time_allowed) {
      this.showAlert(`[color=#ff0000][size=${14 * this.game.getGameConfig().ui_scale}]\u60A8\u7684\u8D26\u53F7\u5C5E\u4E8E\u672A\u6210\u5E74\u4EBA[/size][/color]
\u4ECA\u65E5\u7D2F\u8BA1\u65F6\u957F\u5DF2\u8D85\u8FC7${(data.max_time_allowed / 3600).toFixed(1)}\u5C0F\u65F6\uFF01
\u4E0D\u53EF\u767B\u5F55`, callback);
      return false;
    }
    return true;
  }
  showAlert(text, callback) {
    this.game.peer.render.showAlert(text, i18n.t("common.tips"));
  }
  set enable(val) {
    this.mEnable = val;
  }
  set gameId(val) {
    let gameId = val;
    const index = val.lastIndexOf(".");
    if (index > -1) {
      gameId = gameId.slice(index + 1, gameId.length);
    }
    this.mGameId = gameId;
    this.sync();
  }
}
