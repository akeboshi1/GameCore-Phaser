import {AnimationModel, IAnimationData, IDisplay, IFramesModel, RunningAnimation} from "structure";
import {Direction, Logger, LogicPoint} from "utils";
import {op_client, op_def, op_gameconfig, op_gameconfig_01} from "pixelpai_proto";
import {Helpers} from "game-capsule";
import * as sha1 from "simple-sha1";
import {Sprite} from "./sprite";

export class FramesModel implements IFramesModel {

    static createFromDisplay(display, animation, id?: number) {
        const anis = [];
        const aniName = animation[0].node.name;
        for (const ani of animation) {
            anis.push(new AnimationModel(ani));
          }
        const animations = new Map();
        for (const aniData of anis) {
            animations.set(aniData.name, aniData);
        }
        return {
            animations,
            id: id || 0,
            gene: sha1.sync(display.dataPath + display.texturePath),
            discriminator: "FramesModel",
            animationName: aniName,
            display
        };
    }

    avatarDir?: number;
    readonly discriminator: string = "FramesModel";
    public id: number;
    public type: string;
    public eventName: number[];
    public display: IDisplay | null;
    public animations: Map<string, AnimationModel>;
    public animationName: string;
    public package: op_gameconfig.IPackage;
    public shops: op_gameconfig.IShop[];
    public gene: string;

    constructor(data: any) {
        // TODO 定义IElement接口
        this.id = data.id || 0;
        this.type = data.sn || "";
        this.eventName = data.eventName;
        const anis = data.animations;
        if (anis) {
            this.animationName = anis.defaultAnimationName;
            this.setDisplay(anis.display);
            this.setAnimationData(anis.animationData);
        }
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }

    public getAnimationData(): Map<string, IAnimationData> {
        return this.animations;
    }

    public existAnimation(aniName: string): boolean {
        if (!this.animations) return false;
        return this.animations.has(aniName);
    }

    public getAnimations(name: string): IAnimationData {
        if (!this.animations) return;
        return this.animations.get(name);
    }

    public destroy() {
        if (this.animations) this.animations.clear();
    }

    public createProtocolObject(): op_gameconfig_01.IAnimationData[] {
        const anis: op_gameconfig_01.IAnimationData[] = [];
        this.animations.forEach((ani: AnimationModel) => {
            anis.push(ani.createProtocolObject());
        }, this);
        return anis;
    }

    public getCollisionArea(aniName: string, flip: boolean = false): number[][] {
        const ani = this.getAnimations(aniName);
        if (ani) {
            if (flip) {
                return Helpers.flipArray(ani.collisionArea);
            }
            return ani.collisionArea;
        }
    }

    public getWalkableArea(aniName: string, flip: boolean = false): number[][] {
        const ani = this.getAnimations(aniName);
        if (!ani) {
            return;
        }
        if (flip) {
            return Helpers.flipArray(ani.walkableArea);
        }
        return ani.walkableArea;
    }

    public getInteractiveArea(aniName: string, flip: boolean = false): op_def.IPBPoint2i[] | undefined {
        const ani = this.getAnimations(aniName);
        if (ani) {
            if (flip) {
                const area = [];
                const interactiveArea = ani.interactiveArea;
                for (const interactive of interactiveArea) {
                    area.push({ x: interactive.y, y: interactive.x });
                }
                return area;
            }
            return ani.interactiveArea;
        }
        return;
    }

    public getOriginPoint(aniName, flip: boolean = false): LogicPoint {
        const ani = this.getAnimations(aniName);
        if (ani) {
            const originPoint = ani.originPoint;
            if (flip) {
                return new LogicPoint(originPoint.y, originPoint.x);
            }
            return originPoint;
        }
    }

    public getDirable() { }

    public createSprite(properties: {
        nodeType: op_def.NodeType;
        x: number;
        y: number;
        z?: number;
        id?: number;
        dir?: number;
        isMoss?: boolean;
        layer?: number;
    }): Sprite {
        const { nodeType, x, y, z, id, dir, isMoss, layer } = properties;
        const spr = op_client.Sprite.create();

        if (id) {
            spr.id = id;
        } else {
            spr.id = Helpers.genId();
        }
        spr.layer = layer;
        spr.display = this.display;
        spr.currentAnimationName = this.animationName;
        const point3f = op_def.PBPoint3f.create();
        point3f.x = x;
        point3f.y = y;
        if (z) {
            point3f.z = z;
        }
        spr.point3f = point3f;
        spr.animations = this.createProtocolObject();
        if (dir) {
            spr.direction = dir;
        }

        if (isMoss !== undefined) {
            spr.isMoss = isMoss;
        }

        return new Sprite(spr, nodeType);
    }

    public findAnimation(baseName: string, dir: number): RunningAnimation {
        let animationName = this.checkDirectionAnimation(baseName, dir);
        let flip = false;
        if (animationName) {
            return { name: animationName, flip };
        }
        switch (dir) {
            case Direction.west_south:
            case Direction.east_north:
                animationName = this.getDefaultAnimation(baseName);
                break;
            case Direction.south_east:
                animationName = this.getDefaultAnimation(baseName);
                flip = true;
                break;
            case Direction.north_west:
                animationName = this.checkDirectionAnimation(baseName, Direction.east_north);
                if (animationName === null) {
                    animationName = this.getDefaultAnimation(baseName);
                }
                flip = true;
                break;
        }
        return { name: animationName, flip };
    }

    public checkDirectionAnimation(baseAniName: string, dir: Direction) {
        const aniName = `${baseAniName}_${dir}`;
        if (this.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    }

    // 方向数据检查
    public checkDirectionByExistAnimations(baseAniName: string, dir: number): number {
        let result = dir;
        switch (dir) {
        case Direction.west_south:
        case Direction.south_east:
        case Direction.east_north:
            if (!this.existAnimation(`${baseAniName}_${Direction.east_north}`)) {
                result = Direction.west_south;
            }
            break;
        case Direction.north_west:
            if (!this.existAnimation(`${baseAniName}_${Direction.north_west}`) &&
                !this.existAnimation(`${baseAniName}_${Direction.east_north}`)) {
                result = Direction.south_east;
            }
            break;
        }
        return result;
    }

    private setDisplay(display: op_gameconfig.IDisplay) {
        if (!display) {
            Logger.getInstance().error(`${this.type} display does not exist`);
            return;
        }
        this.display = {
            dataPath: display.dataPath,
            texturePath: display.texturePath,
        };
        this.gene = sha1.sync(display.dataPath + display.texturePath);
    }

    private setAnimationData(aniDatas: AnimationModel[]) {
        if (!aniDatas) {
            Logger.getInstance().error(`${this.id} animationData does not exist`);
            return;
        }
        this.animations = new Map();
        // let ani: IAnimationData;
        for (const aniData of aniDatas) {
            // const baseLoc = aniData.baseLoc;
            // ani = {
            //     name: aniData.name,
            //     frameName: aniData.frameName,
            //     frameRate: aniData.frameRate,
            //     loop: aniData.loop,
            //     baseLoc: new Phaser.Geom.Point(baseLoc.x, baseLoc.y),
            //     // walkableArea: aniData.walkableArea || [],
            //     collisionArea: aniData.collisionArea || [],
            //     originPoint: aniData.originPoint
            // };
            this.animations.set(aniData.name, aniData);
            // this.animations.set(aniData.name + "_7", aniData);
            // this.animations.set(aniData.name + "_1", aniData);
            // this.animations.set(aniData.name + "_5", aniData);
        }
    }

    private getDefaultAnimation(baseName: string) {
        let animationName = this.checkDirectionAnimation(baseName, Direction.west_south);
        if (animationName === null) {
            if (this.existAnimation(baseName)) {
                animationName = baseName;
            } else {
                Logger.getInstance().warn(`${FramesModel.name}: can't find animation ${baseName}`);
                animationName = "idle";
            }
        }
        return animationName;
    }
}
