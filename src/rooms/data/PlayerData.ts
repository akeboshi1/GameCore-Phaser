import { op_client, op_pkt_def } from "pixelpai_proto";
export class PlayerData {
    itemBag: PackageData;
    furniBag: PackageData;
    avatarBag: PackageData;
    mineBag: PackageData;
    editFurniBag: PackageData;

    destroy() {
        if (this.itemBag) this.itemBag.destroy();
        if (this.furniBag) this.furniBag.destroy();
        if (this.avatarBag) this.avatarBag.destroy();
        if (this.mineBag) this.mineBag.destroy();
        if (this.editFurniBag) this.editFurniBag.destroy();
        this.itemBag = undefined;
        this.furniBag = undefined;
        this.avatarBag = undefined;
        this.mineBag = undefined;
        this.editFurniBag = undefined;
    }
    public getItemsByCategory(packType: op_pkt_def.PKT_PackageType, subType: string) {
        const pack = this.getPackage(packType);
        return pack.getItemsByCategory(subType);
    }

    public getItems(packType: op_pkt_def.PKT_PackageType, baseID: string, subType?: string) {
        const pack = this.getPackage(packType);
        return pack.getItems(baseID, subType);
    }

    public getItem(packType: op_pkt_def.PKT_PackageType, indexID: string, baseID?: string, subType?: string) {
        const pack = this.getPackage(packType);
        return pack.getItem(indexID, baseID, subType);
    }

    public getItemsCount(packType: op_pkt_def.PKT_PackageType, baseID: string, subType?: string) {
        const items = this.getItems(packType, baseID, subType);
        let count: number = 0;
        items.forEach((value) => {
            count += value.count;
        });
        return count;
    }
    public syncPackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE) {
        const bag = this.getPackage(content.packageName);
        bag.syncPackage(content);
        return bag;
    }
    public updatePackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE) {
        const bag = this.getPackage(content.packageName);
        bag.updatePackage(content);
    }

    public getPackage(packageName: op_pkt_def.PKT_PackageType) {
        if (packageName === op_pkt_def.PKT_PackageType.PropPackage) {
            if (!this.itemBag) this.itemBag = new PackageData();
            return this.itemBag;
        } else if (packageName === op_pkt_def.PKT_PackageType.FurniturePackage) {
            if (!this.furniBag) this.furniBag = new PackageData();
            return this.furniBag;
        } else if (packageName === op_pkt_def.PKT_PackageType.AvatarPackage) {
            if (!this.avatarBag) this.avatarBag = new PackageData();
            return this.avatarBag;
        } else if (packageName === op_pkt_def.PKT_PackageType.MinePackage) {
            if (!this.mineBag) this.mineBag = new PackageData();
            return this.mineBag;
        } else if (packageName === op_pkt_def.PKT_PackageType.EditFurniturePackage) {
            if (!this.editFurniBag) this.editFurniBag = new PackageData();
            return this.editFurniBag;
        }
    }
}

class PackageData {
    packageName: op_pkt_def.PKT_PackageType;
    list: op_client.ICountablePackageItem[];
    subMap: Map<string, Map<string, op_client.ICountablePackageItem>>;
    limit: number;
    public syncFinish: boolean = false;
    constructor() {
        this.list = [];
        this.subMap = new Map<string, Map<string, op_client.ICountablePackageItem>>();
    }
    public getItemsByCategory(subType: string) {
        if (subType === "alltype") {
            return Array.from(this.list);
        }
        if (this.subMap.has(subType)) {
            const tempMap = this.subMap.get(subType);
            if (tempMap) {
                return Array.from(tempMap.values());
            }
        }
        return undefined;
    }
    public getItems(baseID: string, subType?: string): op_client.ICountablePackageItem[] {
        const items = [];
        if (subType !== undefined && subType !== "alltype") {
            const temMap = this.subMap.get(subType);
            if (temMap) {
                temMap.forEach((value) => {
                    if (value.id === baseID) {
                        items.push(value);
                    }
                });
            }
        } else {
            this.list.forEach((value) => {
                if (value.id === baseID) {
                    items.push(value);
                }
            });
        }
        return items;
    }
    public getItem(indexID: string, baseID?: string, subType?: string) {
        let item: op_client.ICountablePackageItem;
        if (subType !== undefined && subType !== "alltype") {
            const temMap = this.subMap.get(subType);
            if (temMap) {
                if (indexID && temMap.has(indexID)) return temMap.get(indexID);
                else if (baseID) {
                    temMap.forEach((value) => {
                        if (value.id === baseID) {
                            item = value;
                            return item;
                        }
                    });
                }
            }
        } else {
            this.subMap.forEach((values) => {
                if (indexID && values.has(indexID)) {
                    item = values.get(indexID);
                    return item;
                } else if (baseID) {
                    values.forEach((value) => {
                        if (value.id === baseID) {
                            item = value;
                            return item;
                        }
                    });
                }
            });
        }
        return item;
    }
    public syncPackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE) {
        this.packageName = content.packageName;
        if (this.syncFinish) this.clear();
        for (const tempItem of content.items) {
            const subcategory = tempItem.subcategory !== undefined ? tempItem.subcategory : "default";
            let packMap = this.subMap.get(subcategory);
            if (!packMap) {
                packMap = new Map<string, op_client.ICountablePackageItem>();
                this.subMap.set(subcategory, packMap);
            }
            packMap.set(tempItem.indexId, tempItem);
            this.list.push(tempItem);
        }
        if (content.packet.currentFrame === content.packet.totalFrame) {
            this.syncFinish = true;
        }
        this.limit = content.limit;
    }

    public updatePackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE) {
        const items = content.items;
        for (const tempItem of items) {
            if (tempItem.id === "-1") {
                let item: op_client.ICountablePackageItem;
                let index = -1;
                for (const temp of this.list) {
                    index++;
                    if (temp.indexId === tempItem.indexId) {
                        item = temp;
                        break;
                    }
                }
                if (item) {
                    this.list.splice(index, 1);
                    const subcategory = item.subcategory !== undefined ? item.subcategory : "default";
                    const packMap = this.subMap.get(subcategory);
                    if (packMap && packMap.has(item.indexId)) {
                        packMap.delete(item.indexId);
                    }
                }

            } else {
                const subcategory = tempItem.subcategory !== undefined ? tempItem.subcategory : "default";
                let packMap = this.subMap.get(subcategory);
                if (!packMap) {
                    packMap = new Map<string, op_client.ICountablePackageItem>();
                    this.subMap.set(subcategory, packMap);
                }
                if (packMap.has(tempItem.indexId)) {
                    const item = packMap.get(tempItem.indexId);
                    // packMap.set(tempItem.indexId, tempItem);
                    // const listIndex = this.list.indexOf(item);
                    // if (listIndex !== -1) {
                    //     this.list[listIndex] = tempItem;
                    // }
                    for (const key in tempItem) {
                        item[key] = tempItem[key];
                    }
                } else {
                    packMap.set(tempItem.indexId, tempItem);
                    this.list.push(tempItem);
                }
            }
        }
    }

    destroy() {
        this.list.length = 0;
        this.subMap.forEach((values) => {
            values.clear();
        });
        this.subMap.clear();
        this.list = null;
        this.subMap = null;
    }
    clear() {
        this.list.length = 0;
        this.subMap.forEach((values) => {
            values.clear();
        });
        this.subMap.clear();
    }
}
