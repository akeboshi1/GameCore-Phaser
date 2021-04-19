import { IAvatar, IDragonbonesModel, RunningAnimation, Direction, LogicPoint } from "structure";
import { op_def } from "pixelpai_proto";
export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    public eventName: number[];
    avatarDir?: number;
    avatar?: IAvatar;
    animationName?: string;
    constructor(data: any) {
        // this.id = id;
        // this.avatar = avatar;
        if (data) {
            this.id = data.id;
            this.avatar = data.avatar;
            this.eventName = data.eventName;
            const aniName = data.avatar.defaultAnimation;
            if (aniName) this.animationName = aniName;
        }
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }

    public destroy() {
    }

    public getCollisionArea(aniName: string): number[][] {
        return [[1]];
    }

    public getWalkableArea(): number[][] {
        return [[0]];
    }

    public getOriginPoint(aniName): LogicPoint {
        return new LogicPoint(0, 0);
    }

    public getInteractiveArea(): op_def.IPBPoint2i[] {
        return undefined;
    }

    existAnimation(aniName: string) {
        return true;
    }

    public findAnimation(baseName: string, dir: Direction): RunningAnimation {
        let flip = false;
        switch (dir) {
            case Direction.south_east:
            case Direction.east_north:
                flip = true;
                break;
            case Direction.west_south:
            case Direction.north_west:
                break;
        }
        const aniName = this.checkDirectionAnimation(baseName, dir);
        return { name: aniName, flip };
    }

    public checkDirectionAnimation(baseName: string, dir: Direction) {
        let addName: string = "";
        if (dir === Direction.north_west || dir === Direction.east_north) addName = "_back";
        const aniName = `${baseName}${addName}`;
        if (this.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    }

    // 方向数据检查
    public checkDirectionByExistAnimations(baseAniName: string, dir: number): number {
        return dir;
    }
}
