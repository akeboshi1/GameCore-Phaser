import { BaseConfigData } from "gamecore";
import { IAnimation, IAnimationData, IElement } from "../../structure";
import { Logger } from "utils";

export class ElementDataConfig extends BaseConfigData {
    // parseJson(json) {
    //     // 默认不做serializeJson处理
    //     for (const key in json) {
    //         if (json.hasOwnProperty(key)) {
    //             const element = json[key];
    //             this.serializeJson(element);
    //         }
    //     }
    //     super.parseJson(json);
    // }

    // serializeJson(id: string) {
    //     try {
    //         if (this.hasOwnProperty(id)) {
    //             const element: IElement = this[id];
    //             const path = element.serializeString;
    //         }
    //         let temp = obj["serializeString"];
    //         if (temp) {
    //             if (typeof temp === "string")
    //                 temp = JSON.parse(temp);
    //             const pi = temp;
    //             this.game
    //             Object.assign(obj, temp);
    //         }
    //     } catch (error) {
    //         Logger.getInstance().error(error);
    //     }
    // }

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
