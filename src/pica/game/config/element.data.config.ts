import { BaseConfigData } from "gamecore";
import { IAnimation, IAnimationData, IElement } from "../../structure";
import { Logger } from "utils";

export class ElementDataConfig extends BaseConfigData {
    getSerialize(id: string): boolean {
        if (this.hasOwnProperty(id)) {
            const element = this[id];
            return element.serialize;
        }
        return true;
    }

    public get(id: string): IElement {
        if (this.hasOwnProperty(id)) {
            const element = this[id];
            this.extendAnimationData(element);
            return element;
        } else {
            Logger.getInstance().error(`Element表未配置ID为:${id}的数据`);
            return undefined;
        }
    }

    protected extendAnimationData(element: IElement) {
        if (!element.Animations) return;
        const aniData = [];
        for (const ani of element.Animations) {
            ani.layers.forEach((value) => {
                value.frameName = value["frameNames"];
            });
            aniData.push(this.createAnimationData(ani));
        }
        element["AnimationData"] = aniData;
    }

    protected createAnimationData(animation: IAnimation) {
        const obj: IAnimationData = {
            frame: animation.arrFrame,
            frameRate: animation.FrameRate,
            walkableArea: animation.WalkableArea,
            collisionArea: animation.CollisionArea,
            loop: animation.loop,
            originPoint: animation.arrPoint,
            walkOriginPoint: animation.arrwalkableOriginPoint,
            baseLoc: animation.BaseLoc,
            frameName: animation.arrFrameName,
            interactiveArea: animation.interactiveArea,
            frameDuration: animation.frameDurations,
            layer: animation.layers,
            mountLayer: animation.mountLayers,
            node: { name: animation.animation_name, id: 0 }
        };
        return obj;
    }
}
