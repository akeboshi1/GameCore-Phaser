import { ICountablePackageItem } from "./icountablepackageitem";
import { ISkill } from "./iskill";

export interface ICraftSkill {
    skill?: ISkill;

    materials?: ICountablePackageItem[];
    product?: ICountablePackageItem;
    productAnimations?: [];

    _materials?: object;
    _product?: object;
}
