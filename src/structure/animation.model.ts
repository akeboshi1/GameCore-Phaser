import { op_gameconfig_01, op_def } from "pixelpai_proto";
import { IPoint } from "game-capsule";
import { LogicPoint } from "utils";

export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
    interactiveArea?: op_def.IPBPoint2i[];
    mountLayer: op_gameconfig_01.IAnimationMountLayer;
}

export class AnimationModel implements IAnimationData {
    id: number;
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
    interactiveArea: IPoint[];
    mountLayer: op_gameconfig_01.IAnimationMountLayer;
    protected mNode: op_gameconfig_01.INode;
    constructor(ani: op_gameconfig_01.IAnimationData) {
        const tmpBaseLoc = ani.baseLoc.split(",");
        this.mNode = ani.node;
        this.id = ani.node.id;
        this.name = ani.node.name;
        this.frameName = ani.frameName;
        if (!ani.frameName || this.frameName.length < 1) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frames is invalid`);
        }
        this.loop = ani.loop;
        if (!ani.loop) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} loop is invalid`);
        }
        if (!ani.frameRate) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frameRate is invalid`);
        }
        if (ani.originPoint) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} originPoint is invalid`);
        }
        if (!ani.baseLoc) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} baseLoc is invalid`);
        }
        this.frameRate = ani.frameRate;
        this.baseLoc = new LogicPoint(parseInt(tmpBaseLoc[0], 10), parseInt(tmpBaseLoc[1], 10));
        const origin = ani.originPoint;
        this.originPoint = new LogicPoint(origin[0], origin[1]);
        if (typeof ani.collisionArea === "string") {
            this.collisionArea = this.stringToArray(ani.collisionArea, ",", "&") || [[0]];
        } else {
            this.collisionArea = ani.collisionArea || [[0]];
        }

        if (typeof ani.walkableArea === "string") {
            this.walkableArea = this.stringToArray(ani.walkableArea, ",", "&") || [[0]];
        } else {
            this.walkableArea = ani.walkableArea || [[0]];
        }
        // this.mInteractiveArea = [{x: 0, y: 0}];
        this.interactiveArea = ani.interactiveArea;
        this.changeLayer(ani.layer);
        this.mountLayer = ani.mountLayer;
    }

    changeLayer(layer: any[]) {
        this.layer = layer;
        if (this.layer.length < 1) {
            this.layer = [{
                frameName: this.frameName,
                offsetLoc: this.baseLoc
            }];
        }
    }

    createProtocolObject(): op_gameconfig_01.IAnimationData {
        const ani = op_gameconfig_01.AnimationData.create();
        ani.node = this.mNode;
        ani.baseLoc = `${this.baseLoc.x},${this.baseLoc.y}`;
        ani.node.name = this.name;
        ani.loop = this.loop;
        ani.frameRate = this.frameRate;
        ani.frameName = this.frameName;
        ani.originPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkOriginPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkableArea = this.arrayToString(this.walkableArea, ",", "&");
        ani.collisionArea = this.arrayToString(this.collisionArea, ",", "&");
        ani.interactiveArea = this.interactiveArea;
        const layers = [];
        for (const layer of this.layer) {
            layers.push(op_gameconfig_01.AnimationLayer.create(layer));
        }
        ani.layer = layers;
        this.changeLayer(ani.layer);
        ani.mountLayer = this.mountLayer;
        return ani;
    }

    createMount() {
        if (!this.mountLayer) {
            this.mountLayer = op_gameconfig_01.AnimationMountLayer.create();
            this.mountLayer.mountPoint = [op_def.PBPoint3f.create({ x: 0, y: 0 })];
            this.mountLayer.index = 0;
        }
    }

    private stringToArray(string: string, fristJoin: string, lastJoin: string) {
        if (!string) {
            return;
        }
        const tmp = string.split(lastJoin);
        const result = [];
        for (const ary of tmp) {
            const tmpAry = ary.split(fristJoin);
            result.push(tmpAry.map((value) => parseInt(value, 10)));
        }
        return result;
    }

    private arrayToString<T>(array: T[][], fristJoin: string, lastJoin: string): string {
        if (!array) return "";
        const tmp = [];
        for (const ary of array) {
            tmp.push(ary.join(fristJoin));
        }
        return tmp.join(lastJoin);
    }
}
