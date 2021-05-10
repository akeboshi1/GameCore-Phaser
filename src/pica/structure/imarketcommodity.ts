export interface IShopBase {
    id: string;
    itemId: string;

    name?: string;

    icon?: string;

    category?: string;

    subcategory?: string;

    source?: string;

    des?: string;

    currencyId: string;

    price?: number;

    className: string;

    sn?: string;

    suitType?: string;

    tag?: string;

    version?: string;

    slot?: string;
}
export interface IMarketCommodity extends IShopBase {

    price?: IPrice[] | any;

    remainNumber?: number;

    eachPurchaseNumber?: number;

    shortName?: string;

    requireValues?: ICompareValue[];

    affectValues?: ICompareValue[];

    limit?: number;

    remain?: number;

    manorState?: number;
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

export interface IDecorateShop extends IShopBase {
    elementId?: string;
    status: number;
    price?: IPrice[] | any;
}
