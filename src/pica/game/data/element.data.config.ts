import { BaseConfigData } from "gamecore";
import { IAnimation, IAnimationData, IElement } from "picaStructure";
import { Logger } from "utils";

export class ElementDataConfig extends BaseConfigData {
    parseJson(json) {
        for (const key in json) {
            if (json.hasOwnProperty(key)) {
                const element = json[key];
                this.serializeJson(element);
            }
        }
        super.parseJson(json);
    }

    serializeJson(obj: object) {
        try {
            let temp = obj["serializeString"];
            if (temp) {
                if (typeof temp === "string")
                    temp = JSON.parse(temp);
                Object.assign(obj, temp);
            }
        } catch (error) {
            Logger.getInstance().error(error);
        }
    }

    public get(id: string): IElement {
        if (this.hasOwnProperty(id)) {
            const element = this[id];
            this.extendAnimationData(element);
            return element;
        } else {
            // tslint:disable-next-line:no-console
            console.error(`Element表未配置ID为:${id}的数据`);
            return undefined;
        }
    }

    protected extendAnimationData(element: IElement) {
        if (!element.Animations) return;
        const aniData = [];
        for (const ani of element.Animations) {
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
            mountLayer: animation.mountLayer
        };
        return obj;
    }
}
