import { Game } from "../../game";
import {Logger, ResUtils} from "utils";

export class HttpService {
    private api_root: string;
    constructor(private game: Game) {
        this.api_root = this.game.getGameConfig().api_root;
    }
    /**
     * 用户关注其他用户
     * @param uids
     */
    follow(fuid: string): Promise<Response> {
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
     * 添加到黑名单
     * @param fuid
     */
    banUser(fuid: string) {
        return this.post(`user/ban`, { fuid });
    }

    /**
     * 移除黑名单
     * @param fuid
     */
    removeBanUser(fuid: string) {
        return this.post(`user/unban`, { fuid });
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
        return fetch(`${this.game.getGameConfig().api_root}${`account/signin`}`, {
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
    requestPhoneCode(phone: string, areaCode: string): Promise<Response> {
        return fetch(`${this.api_root}${`account/sms_code`}`, {
            body: JSON.stringify({ phone, areaCode }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json());
    }

    /**
     * 检查token是否可用
     */
    tokenCheck() {
        return this.get("account/tokencheck");
    }

    refreshToekn(refreshToken: string, token: string) {
        return this.post("account/refresh_token", { refreshToken, token });
    }

    loginByPhoneCode(phone: string, code: string, areaCode: string): Promise<Response> {
        // TODO App-Key外部传入
        return fetch(`${this.api_root}${`account/phone_signin`}`, {
            body: JSON.stringify({ phone, code, areaCode }),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "App-Key": "831dab"
            }
        }).then((response) => response.json());
    }

    quickLogin(): Promise<Response> {
        return fetch(`${this.api_root}${`account/quick_signin`}`, {
            method: "POST",
        }).then((response) => response.json());
    }

    verified(realName: string, identifcationCode: string) {
        // return fetch(`${this.api_root}${`game/real_name_authentication`}`, {
        //     body: JSON.stringify({ realName, identifcationCode  }),
        //     method: "POST",
        // }).then((response) => response.json());
        return this.post(`game/real_name_authentication`, { realName, identifcationCode });
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

    playedDuration(Appid: string, gameId: string) {
        return this.post("game/played_duration", { gameId }, { "App-Key": Appid });
    }

    /**
     * 上传人物头像
     * @param url
     */
    async uploadHeadImage(url: string) {
        const account = await this.game.peer.render.getAccount();
        if (!account) {
            return Promise.reject("account does not exist");
        }
        const accountData = account.accountData;
        if (!accountData || !accountData.id) {
            return Promise.reject("accountData does not exist");
        }
        return this.post("file_upload_mq", { filename: `${accountData.id}/avatar/${Math.ceil(Math.random() * 1e5)}.png`, blob: url, type: "avatar"});
    }

    async uploadSnapshot(url: string): Promise<string> {
        const account = await this.game.peer.render.getAccount();
        if (!account) {
            return Promise.reject("account does not exist");
        }
        const accountData = account.accountData;
        if (!accountData || !accountData.id) {
            return Promise.reject("accountData does not exist");
        }
        return new Promise((resolve, reject) => {
            const filename = `${accountData.id}/snapshot/${Math.ceil(Math.random() * 1e5)}.png`;
            this.post("file_upload_mq", { filename, blob: url, type: "png"}).then((response) => {
                if (response.code === 200) {
                    return resolve(this.game.getGameConfig().osd + `${filename}`);
                } else {
                    reject(response.msg);
                }
            });
        });
    }

    uploadDBTexture(key: string, url: string, json: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const path = "user_avatar/texture/";
            const imgFullName = path + key + ".png";
            const jsonFullName = path + key + ".json";

            // head first
            const usrAvatarTextureUrls = ResUtils.getUsrAvatarTextureUrls(key);
            Promise.all([this.head(usrAvatarTextureUrls.img), this.head(usrAvatarTextureUrls.json)])
                .then((statusArr) => {
                    let exit404 = false;
                    for (const status of statusArr) {
                        if (status === 404) {
                            exit404 = true;
                            break;
                        }
                    }
                    if (exit404) {
                        Promise.all([this.post("file_upload_mq", { filename: jsonFullName, blob: json, type: "json" }),
                            this.post("file_upload_mq", { filename: imgFullName, blob: url, type: "png"})])
                            .then((responses) => {
                                resolve(null);
                                for (const respons of responses) {
                                    if (respons.status === 404) {
                                        Logger.getInstance().error("file_upload_mq error: ", respons);
                                    }
                                }
                            })
                            .catch((reason) => {
                                reject(reason);
                            });
                    } else {
                        resolve(null);
                    }
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    userHeadsImage(uids: string[]) {
        return this.get(`account/get_head_img?uids=${JSON.stringify(uids)}`);
    }
    public async post(uri: string, body: any, headers?: any): Promise<any> {
        const account = await this.game.peer.render.getAccount();
        if (!account) {
            return Promise.reject("account does not exist");
        }
        const accountData = account.accountData;
        // if (!accountData) {
        //     return Promise.reject("token does not exist");
        // }
        headers = Object.assign({
            "Content-Type": "application/json",
            "X-Pixelpai-TK": accountData ? accountData.accessToken : undefined
        }, headers);
        const data = {
            body: JSON.stringify(body),
            method: "POST",
            headers,
        };
        // Logger.getInstance().debug("#post ", `${this.api_root}${uri}`, data);
        return fetch(`${this.api_root}${uri}`, data).then((response) => response.json());
    }

    public async head(url: string): Promise<number> {
        const data = {
            method: "HEAD"
        };
        return fetch(url, data).then((response) => response.status);
    }

    public get(uri: string) {
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
