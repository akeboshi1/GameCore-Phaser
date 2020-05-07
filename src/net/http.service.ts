import { WorldService } from "../game/world.service";

export class HttpService {
    constructor(private mWorld: WorldService) { }
    /**
     * 用户关注其他用户
     * @param uids
     */
    follow(fuid: string[]): Promise<Response> {
        return this.post("user/follow", { fuid });
    }

    /**
     * 用户取消关注其他用户
     * @param fuid
     */
    unfollow(fuid: string): Promise<Response> {
        return this.post("user/unfollow", { fuid });
    }

    /**
     * 检查用户列表是否有关注的用户
     * @param uids
     */
    checkFollowed(uids: string[]): Promise<Response> {
        return this.post(`user/check_followed`, { "uids": uids });
    }

    /**
     * 登录
     * @param name
     * @param password
     */
    login(account: string, password: string): Promise<Response> {
        return fetch(`${CONFIG.api_root}${`account/signin`}`, {
            body: JSON.stringify({ account, password }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json());
    }

    /**
     * 请求手机验证码
     * @param name
     */
    requestPhoneCode(phone: string): Promise<Response> {
        return fetch(`${CONFIG.api_root}${`account/sms_code`}`, {
            body: JSON.stringify({ phone }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json());
    }

    loginByPhoneCode(phone: string, code: string): Promise<Response> {
        return fetch(`${CONFIG.api_root}${`account/phone_signin`}`, {
            body: JSON.stringify({ phone, code }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json());
    }

    quickLogin(): Promise<Response> {
        return fetch(`${CONFIG.api_root}${`account/quick_signin`}`, {
            method: "POST",
        }).then((response) => response.json());
    }

    /**
     *
     * 获取用户好友列表
     */
    firend() {
        return this.get("user/friends");
    }
    /**
     * 获取用户信息
     * @param uid
     */
    userDetail(uid: string) {
        return this.get(`account/${uid}/detail`);
    }

    /**
     * 用户徽章
     * @param uid
     */
    badgecards(uid: string) {
        return this.get(`userpackage/${uid}/badgecards`);
    }

    private post(uri: string, body: any): Promise<Response> {
        const account = this.mWorld.account;
        if (!account) {
            return Promise.reject("account does not exist");
        }
        if (!account.accountData) {
            return Promise.reject("token does not exist");
        }
        const data = {
            body: JSON.stringify(body),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Pixelpai-TK": account.accountData.token
            }
        };
        return fetch(`${CONFIG.api_root}${uri}`, data).then((response) => response.json());
    }

    private get(uri: string) {
        const account = this.mWorld.account;
        if (!account) {
            return Promise.reject("account does not exist");
        }
        if (!account.accountData) {
            return Promise.reject("token does not exist");
        }
        const data = {
            method: "GET",
            headers: {
                "X-Pixelpai-TK": account.accountData.token
            }
        };
        return fetch(`${CONFIG.api_root}${uri}`, data).then((response) => response.json());
    }
}
