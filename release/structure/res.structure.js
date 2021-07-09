import { i18n } from "./i18n";
export var CoinType;
(function(CoinType2) {
  CoinType2[CoinType2["TU_DING_COIN"] = 0] = "TU_DING_COIN";
  CoinType2[CoinType2["QING_SONG_TANG"] = 1] = "QING_SONG_TANG";
  CoinType2[CoinType2["GOLD_COIN"] = 2] = "GOLD_COIN";
  CoinType2[CoinType2["COIN"] = 3] = "COIN";
  CoinType2[CoinType2["DIAMOND"] = 4] = "DIAMOND";
})(CoinType || (CoinType = {}));
export class Coin {
  static getIcon(coinType) {
    let res = "tuding_icon";
    const type = coinType;
    if (type === 3) {
      res = "iv_coin";
    } else if (type === 4) {
      res = "iv_diamond";
    } else if (type === 2) {
    } else if (type === 1) {
    } else if (type === 0) {
    }
    return res;
  }
  static getName(coinType) {
    let res = "\u94F6\u5E01";
    const type = coinType;
    if (type === 3) {
      res = i18n.t("coin.coin");
    } else if (type === 4) {
      res = i18n.t("coin.diamond");
    } else if (type === 2) {
      res = i18n.t("coin.gold_coin");
    } else if (type === 1) {
    } else if (type === 0) {
    }
    return res;
  }
}
