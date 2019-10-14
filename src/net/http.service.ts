import {WorldService} from "../game/world.service";

export class HttpService {
    constructor(private mWorld: WorldService) { }

    /**
     * 用户关注其他用户
     * @param uids
     */
    follow(fuid: string[]): Promise<Response> {
        return this.post("user/follow", JSON.stringify({ fuid}));
    }

    /**
     * 用户取消关注其他用户
     * @param fuid
     */
    unfollow(fuid: string): Promise<Response> {
        return this.post("user/unfollow", JSON.stringify({ fuid }));
    }

    /**
     * 检查用户列表是否有关注的用户
     * @param uids
     */
    checkFollowed(uids: number[]): Promise<Response> {
        return this.post(`user/check_followed`, JSON.stringify({ uids }));
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

    private post(uri: string, body: string): Promise<Response> {
        const account = this.mWorld.account;
        if (!account) {
            return Promise.reject("account does not exist");
        }
        if (!account.accountData) {
            return Promise.reject("token does not exist");
        }
        const data = {
            body,
            method: "POST",
            headers: {
                "X-Pixelpai-TK": account.accountData.token
            }
        };
        return fetch(`${CONFIG.api_root}/${uri}`, data);
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
        return fetch(`${CONFIG.api_root}/`, data);
    }
}
