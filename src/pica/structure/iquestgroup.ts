import { ICountablePackageItem } from "./icountablepackageitem";

export interface IQuestGroup {
    id: string;
    name: string;
    des: string;
    itemid: string;
    reward: ICountablePackageItem;
}
