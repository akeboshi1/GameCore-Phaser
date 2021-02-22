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

// cabinType: 1
// detail: "目标！升职加薪！"
// display: Display {texturePath: "pkth5/npc/npc01.png"}
// id: "JOB0000001"
// name: "杂活小工"
// rewards: [CountablePackageItem]
// targets: []
