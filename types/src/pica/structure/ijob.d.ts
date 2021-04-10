import { ICountablePackageItem } from "./icountablepackageitem";
export interface IJob {
    id?: string;
    name?: string;
    des?: string;
    publisherId?: string;
    cabinType: number;
    attrRequirements?: object;
    coinRange?: number[];
    rewards?: ICountablePackageItem[];
    requirements?: ICountablePackageItem[];
}
