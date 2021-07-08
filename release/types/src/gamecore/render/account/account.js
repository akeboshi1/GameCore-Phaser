var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Logger } from "structure";
import { Export } from "webworker-rpc";
var Account = /** @class */ (function () {
    function Account() {
        // TODO
        // 1. 登陆注册的逻辑在这里做
        // 2. 缓存用户登陆后的帐号咨讯
    }
    Account.prototype.getAccountData = function () {
        return this.accountData;
    };
    // public accountData(): Promise<any> {
    //     return new Promise<any>((resolve) => {
    //         resolve(this.accountData);
    //     });
    // }
    Account.prototype.setAccount = function (val) {
        // this.clear();
        // Object.assign(this.mCurAccountData, val);
        this.accountData = {
            id: val.id,
            fingerprint: val.fingerprint,
            refreshToken: val.refreshToken,
            expire: val.expire,
            accessToken: val.token || val.accessToken,
            gateway: val.gateway
        };
        this.saveLocalStorage();
    };
    Account.prototype.refreshToken = function (data) {
        if (!this.accountData) {
            try {
                this.accountData = JSON.parse(localStorage.getItem("token"));
            }
            catch (_a) {
                return Logger.getInstance().error("parse token error");
            }
        }
        var newExpire = data.newExpire, newFingerprint = data.newFingerprint, newToken = data.newToken;
        this.accountData.expire = newExpire;
        this.accountData.fingerprint = newFingerprint;
        this.accountData.accessToken = newToken;
        this.saveLocalStorage();
    };
    Account.prototype.saveLocalStorage = function () {
        if (!this.accountData) {
            return;
        }
        var _a = this.accountData, id = _a.id, fingerprint = _a.fingerprint, refreshToken = _a.refreshToken, expire = _a.expire, accessToken = _a.accessToken, gateway = _a.gateway;
        try {
            localStorage.setItem("token", JSON.stringify({ id: id, fingerprint: fingerprint, refreshToken: refreshToken, expire: expire, accessToken: accessToken, gateway: gateway }));
        }
        catch (_b) {
            Logger.getInstance().warn("write localStorage fail");
        }
    };
    Account.prototype.clear = function () {
        this.accountData = null;
    };
    Account.prototype.destroy = function () {
        this.clear();
        localStorage.removeItem("token");
        this.enterGame(undefined, undefined, undefined, undefined, undefined);
    };
    Account.prototype.enterGame = function (gameId, virtualWorldId, sceneId, loc, spawnPointId, worldId) {
        this.gameId = gameId;
        this.virtualWorldId = virtualWorldId;
        this.sceneID = sceneId;
        this.loc = loc;
        this.spawnPointId = spawnPointId;
        this.worldId = worldId;
    };
    Object.defineProperty(Account.prototype, "gameID", {
        get: function () {
            return this.gameId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "sceneId", {
        get: function () {
            return this.sceneID;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Export()
    ], Account.prototype, "getAccountData", null);
    __decorate([
        Export()
    ], Account.prototype, "setAccount", null);
    __decorate([
        Export()
    ], Account.prototype, "refreshToken", null);
    __decorate([
        Export()
    ], Account.prototype, "saveLocalStorage", null);
    __decorate([
        Export()
    ], Account.prototype, "clear", null);
    __decorate([
        Export()
    ], Account.prototype, "destroy", null);
    __decorate([
        Export()
    ], Account.prototype, "enterGame", null);
    return Account;
}());
export { Account };
//# sourceMappingURL=account.js.map