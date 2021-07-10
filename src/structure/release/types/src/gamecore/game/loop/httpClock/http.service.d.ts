import { Game } from "../../game";
export declare class HttpService {
    private game;
    private api_root;
    constructor(game: Game);
    /**
     * 用户关注其他用户
     * @param uids
     */
    follow(fuid: string): Promise<Response>;
    /**
     * 用户取消关注其他用户
     * @param fuid
     */
    unfollow(fuid: string): Promise<Response>;
    /**
     * 添加到黑名单
     * @param fuid
     */
    banUser(fuid: string): Promise<any>;
    /**
     * 移除黑名单
     * @param fuid
     */
    removeBanUser(fuid: string): Promise<any>;
    /**
     * 检查用户列表是否有关注的用户
     * @param uids
     */
    checkFollowed(uids: string[]): Promise<Response>;
    /**
     * 登录
     * @param name
     * @param password
     */
    login(account: string, password: string): Promise<Response>;
    /**
     * 请求手机验证码
     * @param name
     */
    requestPhoneCode(phone: string, areaCode: string): Promise<Response>;
    /**
     * 检查token是否可用
     */
    tokenCheck(): Promise<unknown>;
    refreshToekn(refreshToken: string, token: string): Promise<any>;
    loginByPhoneCode(phone: string, code: string, areaCode: string): Promise<Response>;
    quickLogin(): Promise<Response>;
    verified(realName: string, identifcationCode: string): Promise<any>;
    /**
     *
     * 获取用户好友列表
     */
    firend(): Promise<unknown>;
    /**
     * 获取用户信息
     * @param uid
     */
    userDetail(uid: string): Promise<unknown>;
    /**
     * 用户徽章
     * @param uid
     */
    badgecards(uid: string): Promise<unknown>;
    playedDuration(Appid: string, gameId: string): Promise<any>;
    /**
     * 上传人物头像
     * @param url
     */
    uploadHeadImage(url: string): Promise<any>;
    uploadDBTexture(key: string, url: string, json: string): Promise<any>;
    userHeadsImage(uids: string[]): Promise<unknown>;
    post(uri: string, body: any, headers?: any): Promise<any>;
    get(uri: string): Promise<unknown>;
}
