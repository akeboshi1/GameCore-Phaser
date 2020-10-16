interface IAccountData {
    accessToken: string;
    refreshToken: string;
    expire: number;
    fingerprint: string;
    id: string;
}
export class Account {
    private mGameId: string;
    private mVirtualWorldId: string;
    private mSceneID: number;
    private mLoc: any;
    private mCurAccountData: IAccountData;
    constructor() {
        // TODO
        // 1. 登陆注册的逻辑在这里做
        // 2. 缓存用户登陆后的帐号咨讯
    }

    public setAccount(val: any) {
        // this.clear();
        // Object.assign(this.mCurAccountData, val);
        this.mCurAccountData = {
            id: val.id,
            fingerprint: val.fingerprint,
            refreshToken: val.refreshToken,
            expire: val.expire,
            accessToken: val.token || val.accessToken
        };
        this.saveLocalStorage();
    }

    public refreshToken(data: any) {
        if (this.mCurAccountData) {
            const { newExpire, newFingerprint, newToken } = data;
            this.mCurAccountData.expire = newExpire;
            this.mCurAccountData.fingerprint = newFingerprint;
            this.mCurAccountData.accessToken = newToken;
            this.saveLocalStorage();
        }
    }

    public saveLocalStorage() {
        if (!this.mCurAccountData) {
            return;
        }
        const { id, fingerprint, refreshToken, expire, accessToken } = this.mCurAccountData;
        localStorage.setItem("token", JSON.stringify({ id, fingerprint, refreshToken, expire, accessToken }));
    }

    public clear() {
        this.mCurAccountData = {
            accessToken: "",
            expire: 0,
            fingerprint: "",
            id: "",
            refreshToken: ""
        };
    }

    public destroy() {
        this.clear();
        localStorage.removeItem("token");
        this.enterGame(undefined, undefined, undefined, undefined);
    }

    public get accountData(): IAccountData | undefined {
        return this.mCurAccountData;
    }

    public enterGame(gameId: string, virtualWorldId: string, sceneId: number, loc: any) {
        this.mGameId = gameId;
        this.mVirtualWorldId = virtualWorldId;
        this.mSceneID = sceneId;
        this.mLoc = loc;
    }

    get gameID(): string {
        return this.mGameId;
    }

    get virtualWorldId(): string {
        return this.mVirtualWorldId;
    }

    get sceneId(): number {
        return this.mSceneID;
    }

    get loc(): any {
        return this.mLoc;
    }
}
