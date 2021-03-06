import { IPos, Logger } from "structure";

export interface IAccountData {
    accessToken: string;
    expire: number;
    fingerprint: string;
    id: string;
    role?: Role;
    token?: string;
    refreshToken?: string;
    gateway?: { host: string, port: number };
}

export enum Role {
    Admin,
    Member,
    Tourist
}

interface Config {
    // 外部传入游戏配置。gameId和virtualWorldId在切换游戏是会改变
    gameId: string,
    virtualWorldId: string,
    worldId?: string
}

export class Account {
    public gameId: string;
    public virtualWorldId: string;
    public sceneID: number;
    public loc: IPos;
    public spawnPointId: number;
    public accountData: IAccountData;
    public worldId: string;
    constructor(protected config: Config) {
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
    public setAccount(val: IAccountData) {
        // this.clear();
        // Object.assign(this.mCurAccountData, val);
        this.accountData = {
            id: val.id,
            fingerprint: val.fingerprint,
            refreshToken: val.refreshToken,
            expire: val.expire,
            accessToken: val.token || val.accessToken,
            gateway: val.gateway,
            role: val.role
        };
        this.saveLocalStorage();
        this.resetGame();
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
        const { id, fingerprint, refreshToken, expire, accessToken, gateway } = this.accountData;
        try {
            localStorage.setItem("token", JSON.stringify({ id, fingerprint, refreshToken, expire, accessToken, gateway }));
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
        this.clearGame();
    }

    public resetGame() {
        this.gameId = this.config.gameId;
        this.virtualWorldId = this.config.virtualWorldId;
        this.worldId = this.config.worldId;
        this.sceneID = undefined;
        this.loc = undefined;
        this.spawnPointId = undefined;
    }

    public enterGame(gameId: string, virtualWorldId: string, sceneId: number, loc: any, spawnPointId, worldId?: string) {
        this.gameId = gameId;
        this.virtualWorldId = virtualWorldId;
        this.sceneID = sceneId;
        this.loc = loc;
        this.spawnPointId = spawnPointId;
        this.worldId = worldId;
    }

    protected clearGame() {
        this.enterGame(undefined, undefined, undefined, undefined, undefined);
    }

    get gameID(): string {
        return this.gameId;
    }

    get sceneId(): number {
        return this.sceneID;
    }
}
