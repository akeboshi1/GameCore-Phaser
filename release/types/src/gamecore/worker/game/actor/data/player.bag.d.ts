import { op_client, op_pkt_def } from "pixelpai_proto";
export declare class PlayerBag {
    itemBag: PackageData;
    furniBag: PackageData;
    avatarBag: PackageData;
    mineBag: PackageData;
    editFurniBag: PackageData;
    destroy(): void;
    getItemsByCategory(packType: op_pkt_def.PKT_PackageType, subType: string): op_client.ICountablePackageItem[];
    getItems(packType: op_pkt_def.PKT_PackageType, baseID: string, subType?: string): op_client.ICountablePackageItem[];
    getItem(packType: op_pkt_def.PKT_PackageType, indexID: string, baseID?: string, subType?: string): op_client.ICountablePackageItem;
    getItemsCount(packType: op_pkt_def.PKT_PackageType, baseID: string, subType?: string): number;
    syncPackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE): PackageData;
    updatePackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE): void;
    getPackage(packageName: op_pkt_def.PKT_PackageType): PackageData;
}
declare class PackageData {
    packageName: op_pkt_def.PKT_PackageType;
    list: op_client.ICountablePackageItem[];
    subMap: Map<string, Map<string, op_client.ICountablePackageItem>>;
    limit: number;
    syncFinish: boolean;
    constructor();
    getItemsByCategory(subType: string): op_client.ICountablePackageItem[];
    getItems(baseID: string, subType?: string): op_client.ICountablePackageItem[];
    getItem(indexID: string, baseID?: string, subType?: string): op_client.ICountablePackageItem;
    getSubCategory(): (() => IterableIterator<string>)[];
    syncPackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE): void;
    updatePackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE): void;
    destroy(): void;
    clear(): void;
}
export {};
