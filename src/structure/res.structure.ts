import { i18n } from "./i18n";
export enum CoinType {
    TU_DING_COIN = 0,
    QING_SONG_TANG = 1,
    GOLD_COIN = 2,
    COIN = 3,
    DIAMOND = 4
}

export class Coin {
    static getIcon(coinType: number) {
        let res = "tuding_icon";
        const type = <CoinType>coinType;
        if (type === CoinType.COIN) {
            res = "iv_coin";
        } else if (type === CoinType.DIAMOND) {
            res = "iv_diamond";
        } else if (type === CoinType.GOLD_COIN) {
            // res = "";
        } else if (type === CoinType.QING_SONG_TANG) {
            // res = "";
        } else if (type === CoinType.TU_DING_COIN) {
            // res = "";
        }
        return res;
    }
    static getName(coinType: number) {
        let res = "银币";
        const type = <CoinType>coinType;
        if (type === CoinType.COIN) {
            res = i18n.t("coin.coin");
        } else if (type === CoinType.DIAMOND) {
            res = i18n.t("coin.diamond");
        } else if (type === CoinType.GOLD_COIN) {
            res = i18n.t("coin.gold_coin");
        } else if (type === CoinType.QING_SONG_TANG) {
            // res = "";
        } else if (type === CoinType.TU_DING_COIN) {
            // res = "";
        }
        return res;
    }
}
