export interface IAccountData {
    token: string;
    expire: number;
    fingerprint: string;
    id: string;
}

export class Account {
    private mCurAccountData: IAccountData;
    constructor() {
        // TODO
        // 1. 登陆注册的逻辑在这里做
        // 2. 缓存用户登陆后的帐号咨讯
    }

    public setAccount(val: any) {
        this.mCurAccountData = {
            token: "",
            expire: 0,
            fingerprint: "",
            id: ""
        };
        Object.assign(this.mCurAccountData, val);
    }
    public get accountData(): IAccountData | undefined {
        return this.mCurAccountData;
    }
}
