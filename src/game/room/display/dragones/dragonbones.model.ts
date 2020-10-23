import { op_def } from "pixelpai_proto";
import { RunningAnimation, IAvatar, IDragonbonesModel } from "structureinterface";
import { Direction, LogicPoint } from "../../../../utils";

export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    avatarDir?: number;
    avatar?: IAvatar;
    animationName?: string;

    constructor(data: any) {
        // this.id = id;
        // this.avatar = avatar;
        if (data) {
            this.id = data.id;
            this.avatar = data.avatar;
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
        return [[1, 1], [1, 1]];
    }

    public getWalkableArea(): number[][] {
        return [[1, 1], [1, 1]];
    }

    public getOriginPoint(aniName): Phaser.Geom.Point {
        return new Phaser.Geom.Point(1, 1);
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
                flip = true;
                dir = Direction.west_south;
                break;
            case Direction.east_north:
                flip = true;
                dir = Direction.north_west;
                break;
        }
        let addName: string = "";
        if ((dir >= Direction.north && dir < Direction.west) || dir > Direction.east && dir <= Direction.east_north) addName = "_back";
        return { name: `${baseName}${addName}`, flip };
    }
}
