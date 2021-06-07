import { ICountablePackageItem } from "./icountablepackageitem";

export interface IRecharge {
    id: string;
    nameid: string;
    price: number;
    img: string;
    double: boolean;
    items: ICountablePackageItem[];
    firstPurchaseItems: ICountablePackageItem[];
}