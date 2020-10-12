import { IGroup } from "./IGroup";
import { FollowGroup } from "./FollowGroup";
import { IDispose } from "../actionManager/IDispose";
import { IRoomService } from "../roomManager/room/room";

export class GroupManager implements IDispose {

    protected map: Map<any, IGroup[]> = new Map<any, IGroup[]>();
    public constructor(private room: IRoomService) {
    }

    public createGroup<T extends IGroup>(owner: any, groupType: GroupType) {
        if (!this.hasGroup(owner, groupType)) {
            let groups = this.map.get(owner);
            let group: IGroup;
            if (!groups) {
                groups = [];
                this.map.set(owner, groups);
            }
            if (groupType === GroupType.Follow) {
                const item = new FollowGroup();
                item.owner = owner;
                groups.push(item);
                group = item;
            }
            return group as T;
        }
    }

    public getGroup<T extends IGroup>(owner: any, groupType: GroupType) {
        let group: IGroup;
        if (this.map.has(owner)) {
            const groups = this.map.get(owner);
            for (const item of groups) {
                if (item.groupType === groupType) {
                    group = item;
                    return group as T;
                }
            }
        }
        return group as T;
    }

    public hasGroup(owner: any, groupType: number) {
        const group = this.getGroup(owner, groupType);
        if (group) return true;
        return false;
    }

    public destroy() {
        this.map.forEach((value, key) => {
            for (const item of value) {
                item.destroy();
            }
            value.length = 0;
        });
        this.map.clear();
    }

}

export enum GroupType {
    Follow = 1,
}

export enum GroupEventType {
    DEFAULT_TYPE = "DEFAULT_TYPE",
    REPLACE_TYPE = "REPLACE_TYPE",
}
