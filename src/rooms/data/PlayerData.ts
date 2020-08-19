import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
export class PlayerData {
    itemBag: PackageData;
    furniBag: PackageData;
    avatarBag: PackageData;
    mineBag: PackageData;
    EditFurniBag: PackageData;

    public syncPackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE) {
        const bag = this.getPackage(content.packageName);
        bag.syncPackage(content);
    }
    public updatePackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE) {
        const bag = this.getPackage(content.packageName);
        bag.updatePackage(content);
    }

    private getPackage(packageName: op_pkt_def.PKT_PackageType) {
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
            if (!this.EditFurniBag) this.EditFurniBag = new PackageData();
            return this.EditFurniBag;
        }
    }
}

export class PackageData {
    packageName: op_pkt_def.PKT_PackageType;
    list: op_client.ICountablePackageItem[];
    subMap: Map<string, Map<string, op_client.ICountablePackageItem>>;
    public syncFinish: boolean = false;
    constructor() {
        this.list = [];
        this.subMap = new Map<string, Map<string, op_client.ICountablePackageItem>>();
    }
    public syncPackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE) {
        this.packageName = content.packageName;
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
    }

    public updatePackage(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE) {
        const items = content.items;
        for (const tempItem of items) {
            const subcategory = tempItem.subcategory !== undefined ? tempItem.subcategory : "default";
            let packMap = this.subMap.get(subcategory);
            if (tempItem.id === "-1") {
                if (packMap && packMap.has(tempItem.indexId)) {
                    const item = packMap.get(tempItem.indexId);
                    packMap.delete(tempItem.indexId);
                    const listIndex = this.list.indexOf(item);
                    if (listIndex !== -1) {
                        this.list.splice(listIndex, 1);
                    }
                }

            } else {
                if (!packMap) {
                    packMap = new Map<string, op_client.ICountablePackageItem>();
                    this.subMap.set(subcategory, packMap);
                }
                if (packMap.has(tempItem.indexId)) {
                    const item = packMap.get(tempItem.indexId);
                    packMap.set(tempItem.indexId, tempItem);
                    const listIndex = this.list.indexOf(item);
                    if (listIndex !== -1) {
                        this.list[listIndex] = tempItem;
                    }
                } else {
                    packMap.set(tempItem.indexId, tempItem);
                    this.list.push(tempItem);
                }
            }
        }
    }

}
