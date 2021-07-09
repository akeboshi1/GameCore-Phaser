var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
export class HttpService {
  constructor(game) {
    this.game = game;
    __publicField(this, "api_root");
    this.api_root = this.game.getGameConfig().api_root;
  }
  follow(fuid) {
    return this.post("user/follow", { fuid });
  }
  unfollow(fuid) {
    return this.post("user/unfollow", { fuid });
  }
  banUser(fuid) {
    return this.post(`user/ban`, { fuid });
  }
  removeBanUser(fuid) {
    return this.post(`user/unban`, { fuid });
  }
  checkFollowed(uids) {
    return this.post(`user/check_followed`, { "uids": uids });
  }
  login(account, password) {
    return fetch(`${this.game.getGameConfig().api_root}${`account/signin`}`, {
      body: JSON.stringify({ account, password }),
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => response.json());
  }
  requestPhoneCode(phone, areaCode) {
    return fetch(`${this.api_root}${`account/sms_code`}`, {
      body: JSON.stringify({ phone, areaCode }),
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => response.json());
  }
  tokenCheck() {
    return this.get("account/tokencheck");
  }
  refreshToekn(refreshToken, token) {
    return this.post("account/refresh_token", { refreshToken, token });
  }
  loginByPhoneCode(phone, code, areaCode) {
    return fetch(`${this.api_root}${`account/phone_signin`}`, {
      body: JSON.stringify({ phone, code, areaCode }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "App-Key": "831dab"
      }
    }).then((response) => response.json());
  }
  quickLogin() {
    return fetch(`${this.api_root}${`account/quick_signin`}`, {
      method: "POST"
    }).then((response) => response.json());
  }
  verified(realName, identifcationCode) {
    return this.post(`game/real_name_authentication`, { realName, identifcationCode });
  }
  firend() {
    return this.get("user/friends");
  }
  userDetail(uid) {
    return this.get(`account/${uid}/detail`);
  }
  badgecards(uid) {
    return this.get(`userpackage/${uid}/badgecards`);
  }
  playedDuration(Appid, gameId) {
    return this.post("game/played_duration", { gameId }, { "App-Key": Appid });
  }
  uploadHeadImage(url) {
    return this.post("update_blob", { file: url });
  }
  uploadDBTexture(key, url, json) {
    const path = "user_avatar/texture/";
    const imgFullName = path + key + ".png";
    const jsonFullName = path + key + ".json";
    return this.post("file_upload", { filename: jsonFullName, blob: json, type: "json" }).then(() => {
      return this.post("file_upload", { filename: imgFullName, blob: url, type: "png" });
    });
  }
  userHeadsImage(uids) {
    return this.get(`account/get_head_img?uids=${JSON.stringify(uids)}`);
  }
  post(uri, body, headers) {
    return __async(this, null, function* () {
      const account = yield this.game.peer.render.getAccount();
      if (!account) {
        return Promise.reject("account does not exist");
      }
      const accountData = account.accountData;
      headers = Object.assign({
        "Content-Type": "application/json",
        "X-Pixelpai-TK": accountData ? accountData.accessToken : void 0
      }, headers);
      const data = {
        body: JSON.stringify(body),
        method: "POST",
        headers
      };
      return fetch(`${this.api_root}${uri}`, data).then((response) => response.json());
    });
  }
  get(uri) {
    return new Promise((resolve, reject) => {
      this.game.renderPeer.getAccount().then((account) => {
        if (!account) {
          reject("account does not exist");
        }
        const accountData = account.accountData;
        if (!accountData) {
          return reject("token does not exist");
        }
        const data = {
          method: "GET",
          headers: {
            "X-Pixelpai-TK": accountData.accessToken
          }
        };
        resolve(fetch(`${this.api_root}${uri}`, data).then((response) => response.json()));
      });
    });
  }
}
