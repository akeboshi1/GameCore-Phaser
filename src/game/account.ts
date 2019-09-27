export interface IAccountData {
    id: string;
    nickname: string;
    token: string;
    expire: number;
    avatar: string;
    createdAt: string;
    email: string;
    fingerprint: string;
    level: number;
    maxituan_card: object;
    phone: string;
    recentlyPlayedGames: string[];
    role: number;
    today_grow_exp: number;
    total_exp: number;
    updatedAt: string;
    username: string;
    vip_card: object;
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
            id: "",
            nickname: "",
            token: "",
            expire: 0,
            avatar: "",
            createdAt: "",
            email: "",
            fingerprint: "",
            level: 0,
            maxituan_card: {},
            phone: "",
            recentlyPlayedGames: [],
            role: 0,
            today_grow_exp: 0,
            total_exp: 0,
            updatedAt: "",
            username: "",
            vip_card: {},
        };
        Object.assign(this.mCurAccountData, val.data);
    }
    public get accountData(): IAccountData|undefined {
        return this.mCurAccountData;
    }
}
