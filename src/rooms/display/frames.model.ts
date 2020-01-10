import { op_gameconfig } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { AnimationDataNode } from "game-capsule/lib/configobjects";
import * as sha1 from "simple-sha1";
import {Animation, IAnimationData} from "./animation";

export interface IFramesModel {
    readonly discriminator: string;
    readonly gene: string | undefined;
    id: number;
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: Map<string, IAnimationData>;
    animationName: string;
    package?: op_gameconfig.IPackage;
    shops?: (op_gameconfig.IShop[] | null);
    getAnimations(name: string): IAnimationData;
    getCollisionArea(aniName: string): number[][];
    getOriginPoint(aniName: string): Phaser.Geom.Point;
    destroy();
}

export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}

export class FramesModel implements IFramesModel {
    avatarDir?: number;
    readonly discriminator: string = "FramesModel";
    public id: number;
    public type: string;
    public display: IDisplay | null;
    public animations: Map<string, IAnimationData>;
    public animationName: string;
    public package: op_gameconfig.IPackage;
    public shops: op_gameconfig.IShop[];
    protected mGen: string;
    private mDirable: number;

    constructor(data: any) {
        // TODO 定义IElement接口
        this.id = data.id || 0;
        this.type = data.sn || "";
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

    public getAnimations(name: string): IAnimationData {
        if (!this.animations) return;
        return this.animations.get(name);
    }

    public destroy() {
        if (this.animations) this.animations.clear();
    }

    get gene(): string | undefined {
        return this.mGen;
    }

    public toClient(): op_gameconfig.IAnimation[] {
        const anis: op_gameconfig.IAnimation[] = [];
        this.animations.forEach((ani: IAnimationData) => {
            anis.push(ani.toClient());
        }, this);
        return anis;
    }

    public getCollisionArea(aniName: string): number[][] {
        const ani = this.getAnimations(aniName);
        if (ani) {
            return ani.collisionArea;
        }
    }

    public getOriginPoint(aniName): Phaser.Geom.Point {
        const ani = this.getAnimations(aniName);
        if (ani) {
            return ani.originPoint;
        }
    }

    public getDirable() {
    }

    private setDisplay(display: op_gameconfig.IDisplay) {
        if (!display) {
            Logger.getInstance().error(`${this.type} display does not exist`);
            return;
        }
        this.display = {
            dataPath: display.dataPath,
            texturePath: display.texturePath
        };
        this.mGen = sha1.sync(display.dataPath + display.texturePath);
    }

    private setAnimationData(aniDatas: Animation[]) {
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
        }
    }
}
