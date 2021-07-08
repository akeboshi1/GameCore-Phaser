var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var HttpService = /** @class */ (function () {
    function HttpService(game) {
        this.game = game;
        this.api_root = this.game.getGameConfig().api_root;
    }
    /**
     * 用户关注其他用户
     * @param uids
     */
    HttpService.prototype.follow = function (fuid) {
        return this.post("user/follow", { fuid: fuid });
    };
    /**
     * 用户取消关注其他用户
     * @param fuid
     */
    HttpService.prototype.unfollow = function (fuid) {
        return this.post("user/unfollow", { fuid: fuid });
    };
    /**
     * 添加到黑名单
     * @param fuid
     */
    HttpService.prototype.banUser = function (fuid) {
        return this.post("user/ban", { fuid: fuid });
    };
    /**
     * 移除黑名单
     * @param fuid
     */
    HttpService.prototype.removeBanUser = function (fuid) {
        return this.post("user/unban", { fuid: fuid });
    };
    /**
     * 检查用户列表是否有关注的用户
     * @param uids
     */
    HttpService.prototype.checkFollowed = function (uids) {
        return this.post("user/check_followed", { "uids": uids });
    };
    /**
     * 登录
     * @param name
     * @param password
     */
    HttpService.prototype.login = function (account, password) {
        return fetch("" + this.game.getGameConfig().api_root + "account/signin", {
            body: JSON.stringify({ account: account, password: password }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) { return response.json(); });
    };
    /**
     * 请求手机验证码
     * @param name
     */
    HttpService.prototype.requestPhoneCode = function (phone, areaCode) {
        return fetch("" + this.api_root + "account/sms_code", {
            body: JSON.stringify({ phone: phone, areaCode: areaCode }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) { return response.json(); });
    };
    /**
     * 检查token是否可用
     */
    HttpService.prototype.tokenCheck = function () {
        return this.get("account/tokencheck");
    };
    HttpService.prototype.refreshToekn = function (refreshToken, token) {
        return this.post("account/refresh_token", { refreshToken: refreshToken, token: token });
    };
    HttpService.prototype.loginByPhoneCode = function (phone, code, areaCode) {
        // TODO App-Key外部传入
        return fetch("" + this.api_root + "account/phone_signin", {
            body: JSON.stringify({ phone: phone, code: code, areaCode: areaCode }),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "App-Key": "831dab"
            }
        }).then(function (response) { return response.json(); });
    };
    HttpService.prototype.quickLogin = function () {
        return fetch("" + this.api_root + "account/quick_signin", {
            method: "POST",
        }).then(function (response) { return response.json(); });
    };
    HttpService.prototype.verified = function (realName, identifcationCode) {
        // return fetch(`${this.api_root}${`game/real_name_authentication`}`, {
        //     body: JSON.stringify({ realName, identifcationCode  }),
        //     method: "POST",
        // }).then((response) => response.json());
        return this.post("game/real_name_authentication", { realName: realName, identifcationCode: identifcationCode });
    };
    /**
     *
     * 获取用户好友列表
     */
    HttpService.prototype.firend = function () {
        return this.get("user/friends");
    };
    /**
     * 获取用户信息
     * @param uid
     */
    HttpService.prototype.userDetail = function (uid) {
        return this.get("account/" + uid + "/detail");
    };
    /**
     * 用户徽章
     * @param uid
     */
    HttpService.prototype.badgecards = function (uid) {
        return this.get("userpackage/" + uid + "/badgecards");
    };
    HttpService.prototype.playedDuration = function (Appid, gameId) {
        return this.post("game/played_duration", { gameId: gameId }, { "App-Key": Appid });
    };
    /**
     * 上传人物头像
     * @param url
     */
    HttpService.prototype.uploadHeadImage = function (url) {
        return this.post("update_blob", { file: url });
    };
    HttpService.prototype.uploadDBTexture = function (key, url, json) {
        var _this = this;
        var path = "user_avatar/texture/";
        var imgFullName = path + key + ".png";
        var jsonFullName = path + key + ".json";
        return this.post("file_upload", { filename: jsonFullName, blob: json, type: "json" })
            .then(function () {
            return _this.post("file_upload", { filename: imgFullName, blob: url, type: "png" });
        });
    };
    HttpService.prototype.userHeadsImage = function (uids) {
        return this.get("account/get_head_img?uids=" + JSON.stringify(uids));
    };
    HttpService.prototype.post = function (uri, body, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var account, accountData, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.game.peer.render.getAccount()];
                    case 1:
                        account = _a.sent();
                        if (!account) {
                            return [2 /*return*/, Promise.reject("account does not exist")];
                        }
                        accountData = account.accountData;
                        // if (!accountData) {
                        //     return Promise.reject("token does not exist");
                        // }
                        headers = Object.assign({
                            "Content-Type": "application/json",
                            "X-Pixelpai-TK": accountData ? accountData.accessToken : undefined
                        }, headers);
                        data = {
                            body: JSON.stringify(body),
                            method: "POST",
                            headers: headers,
                        };
                        // Logger.getInstance().debug("#post ", `${this.api_root}${uri}`, data);
                        return [2 /*return*/, fetch("" + this.api_root + uri, data).then(function (response) { return response.json(); })];
                }
            });
        });
    };
    HttpService.prototype.get = function (uri) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.game.renderPeer.getAccount().then(function (account) {
                if (!account) {
                    reject("account does not exist");
                }
                var accountData = account.accountData;
                if (!accountData) {
                    return reject("token does not exist");
                }
                var data = {
                    method: "GET",
                    headers: {
                        "X-Pixelpai-TK": accountData.accessToken
                    }
                };
                resolve(fetch("" + _this.api_root + uri, data).then(function (response) { return response.json(); }));
            });
        });
    };
    return HttpService;
}());
export { HttpService };
//# sourceMappingURL=http.service.js.map