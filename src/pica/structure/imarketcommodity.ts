export interface IShopBase {
    id: string;

    itemId: string;

    name: string;

    icon: string;

    category: string;

    subcategory: string;

    source: string;

    currencyId: string;

    price: number;

    className: string;

}
export interface IMarketCommodity {

    id: string;

    name?: string;

    des?: string;

    icon?: string;

    price?: IPrice[];

    category?: string;

    remainNumber?: number;

    eachPurchaseNumber?: number;

    source?: string;

    shortName?: string;

    requireValues?: ICompareValue[];

    affectValues?: ICompareValue[];

    limit?: number;

    remain?: number;

    manorState?: number;

    sn?: string;

    suitType?: string;

    tag?: string;

    version?: string;

    slot?: string;
}
export interface IPrice {
    price: number;
    coinType: number;
    displayPrecision?: number;
}

export interface ICompareValue {

    key?: string;
    value?: number;
    compareType?: number;
}
