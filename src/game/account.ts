export interface IAccountData {
    token: string;
    expire: number;
    fingerprint: string;
    id: string;
}

export class Account {
    private mGameId: string;
    private mVirtualWorldId: string;
    private mCurAccountData: IAccountData;
    constructor() {
        // TODO
        // 1. 登陆注册的逻辑在这里做
        // 2. 缓存用户登陆后的帐号咨讯
    }

    public setAccount(val: any) {
        this.clear();
        Object.assign(this.mCurAccountData, val);
    }

    public clear() {
        this.mCurAccountData = {
            token: "",
            expire: 0,
            fingerprint: "",
            id: ""
        };
    }

    public destroy() {
        this.clear();
        this.enterGame(undefined, undefined);
    }

    public get accountData(): IAccountData | undefined {
        return this.mCurAccountData;
    }

    public enterGame(gameId: string, virtualWorldId: string) {
        this.mGameId = gameId;
        this.mVirtualWorldId = virtualWorldId;
    }

    get gameID(): string {
        return this.mGameId;
    }

    get virtualWorldId(): string {
        return this.mVirtualWorldId;
    }
}
