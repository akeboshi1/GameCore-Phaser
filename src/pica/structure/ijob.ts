import { ICountablePackageItem } from "./icountablepackageitem";

export interface IJob {
    id?: string;
    name?: string;
    des?: string;
    publisherId?: string;
    cabinType: number;
    attrRequirements?: object; // requirements in setting
    coinRange?: number[];

    rewards?: ICountablePackageItem[];
    requirements?: ICountablePackageItem[]; // converted requirements
}
