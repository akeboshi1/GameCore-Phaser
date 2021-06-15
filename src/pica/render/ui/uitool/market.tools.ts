import { ICurrencyLevel, IMarketCommodity } from "picaStructure";

export class MarketTools {
    static checkLevel(data: IMarketCommodity, currency: ICurrencyLevel) {
        if (data.marketName === "shop") {
            if (data.limit > currency.level) return false;
        } else if (data.marketName === "gradeshop") {
            if (data.limit > currency.reputationLv) return false;
        }
        return true;
    }
}
