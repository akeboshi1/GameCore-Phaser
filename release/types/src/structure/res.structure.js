import { i18n } from "./i18n";
export var CoinType;
(function (CoinType) {
    CoinType[CoinType["TU_DING_COIN"] = 0] = "TU_DING_COIN";
    CoinType[CoinType["QING_SONG_TANG"] = 1] = "QING_SONG_TANG";
    CoinType[CoinType["GOLD_COIN"] = 2] = "GOLD_COIN";
    CoinType[CoinType["COIN"] = 3] = "COIN";
    CoinType[CoinType["DIAMOND"] = 4] = "DIAMOND";
})(CoinType || (CoinType = {}));
var Coin = /** @class */ (function () {
    function Coin() {
    }
    Coin.getIcon = function (coinType) {
        var res = "tuding_icon";
        var type = coinType;
        if (type === CoinType.COIN) {
            res = "iv_coin";
        }
        else if (type === CoinType.DIAMOND) {
            res = "iv_diamond";
        }
        else if (type === CoinType.GOLD_COIN) {
            // res = "";
        }
        else if (type === CoinType.QING_SONG_TANG) {
            // res = "";
        }
        else if (type === CoinType.TU_DING_COIN) {
            // res = "";
        }
        return res;
    };
    Coin.getName = function (coinType) {
        var res = "银币";
        var type = coinType;
        if (type === CoinType.COIN) {
            res = i18n.t("coin.coin");
        }
        else if (type === CoinType.DIAMOND) {
            res = i18n.t("coin.diamond");
        }
        else if (type === CoinType.GOLD_COIN) {
            res = i18n.t("coin.gold_coin");
        }
        else if (type === CoinType.QING_SONG_TANG) {
            // res = "";
        }
        else if (type === CoinType.TU_DING_COIN) {
            // res = "";
        }
        return res;
    };
    return Coin;
}());
export { Coin };
//# sourceMappingURL=res.structure.js.map