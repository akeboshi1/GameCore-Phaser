export declare enum CoinType {
    TU_DING_COIN = 0,
    QING_SONG_TANG = 1,
    GOLD_COIN = 2,
    COIN = 3,
    DIAMOND = 4
}
export declare class Coin {
    static getIcon(coinType: number): string;
    static getName(coinType: number): string;
}
