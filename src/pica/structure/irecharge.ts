import { ICountablePackageItem } from "./icountablepackageitem";

export interface IRecharge {
    id: string;
    nameId: string;
    name?: string;
    price: number;
    texturePath: string;
    double?: boolean;
    items?: ICountablePackageItem[];
    firstPurchaseItems?: ICountablePackageItem[];
    des?: string;
    type?: number;
}
