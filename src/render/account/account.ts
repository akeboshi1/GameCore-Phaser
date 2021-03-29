import { IPos, Logger } from "utils";
import { Render } from "../render";

interface IAccountData {
    accessToken: string;
    refreshToken: string;
    expire: number;
    fingerprint: string;
    id: string;
    gateway?: string;
}
export class Account {
    public gameId: string;
    public virtualWorldId: string;
    public sceneID: number;
    public loc: IPos;
    public spawnPointId: number;
    public accountData: IAccountData;
    public worldId: string;
    constructor() {
        // TODO
        // 1. 登陆注册的逻辑在这里做
        // 2. 缓存用户登陆后的帐号咨讯
    }

    public getAccountData() {
        return this.accountData;
    }

    // public accountData(): Promise<any> {
    //     return new Promise<any>((resolve) => {
    //         resolve(this.accountData);
    //     });
    // }

    public setAccount(val: any) {
        // this.clear();
        // Object.assign(this.mCurAccountData, val);
        this.accountData = {
            id: val.id,
            fingerprint: val.fingerprint,
            refreshToken: val.refreshToken,
            expire: val.expire,
            accessToken: val.token || val.accessToken,
        };
        this.saveLocalStorage();
    }

    public refreshToken(data: any) {
        if (!this.accountData) {
            try {
                this.accountData = JSON.parse(localStorage.getItem("token"));
            } catch {
                return Logger.getInstance().error(`parse token error`);
            }
        }
        const { newExpire, newFingerprint, newToken } = data;
        this.accountData.expire = newExpire;
        this.accountData.fingerprint = newFingerprint;
        this.accountData.accessToken = newToken;
        this.saveLocalStorage();
    }

    public saveLocalStorage() {
        if (!this.accountData) {
            return;
        }
        const { id, fingerprint, refreshToken, expire, accessToken } = this.accountData;
        try {
            localStorage.setItem("token", JSON.stringify({ id, fingerprint, refreshToken, expire, accessToken }));
        } catch {
            Logger.getInstance().warn("write localStorage fail");
        }
    }

    public clear() {
        this.accountData = null;
    }

    public destroy() {
        this.clear();
        localStorage.removeItem("token");
        this.enterGame(undefined, undefined, undefined, undefined, undefined);
    }

    public enterGame(gameId: string, virtualWorldId: string, sceneId: number, loc: any, spawnPointId, worldId?: string) {
        this.gameId = gameId;
        this.virtualWorldId = virtualWorldId;
        this.sceneID = sceneId;
        this.loc = loc;
        this.spawnPointId = spawnPointId;
        this.worldId = worldId;
    }

    get gameID(): string {
        return this.gameId;
    }

    get sceneId(): number {
        return this.sceneID;
    }
}
