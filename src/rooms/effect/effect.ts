import { op_client } from "pixelpai_proto";
import { IDragonbonesModel } from "../display/dragonbones.model";
import { IFramesModel, FramesModel } from "../display/frames.model";
import { Animation } from "../display/animation";
import { Logger } from "../../utils/log";

export class Effect {

    private mID: number;
    private mDisplayInfo: IFramesModel | IDragonbonesModel;
    constructor(id: number) {
        this.mID = id;
    }

    syncSprite(sprite: op_client.ISprite) {
        if (this.mDisplayInfo) {
            this.mDisplayInfo.destroy();
        }
        const { display, animations } = sprite;
        if (display && animations) {
            const anis = [];
            for (const ani of animations) {
                anis.push(new Animation(ani));
            }
            this.mDisplayInfo = new FramesModel({
                animations: {
                    defaultAnimationName: sprite.currentAnimationName,
                    display,
                    animationData: anis,
                },
            });

        }
        Logger.getInstance().log("display info: ", this.mDisplayInfo);
    }

    destroy() {
    }

    get id(): number {
        return this.mID;
    }

    set displayInfo(display: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = display;
    }

    get displayInfo(): IFramesModel | IDragonbonesModel {
        return this.mDisplayInfo;
    }
}
