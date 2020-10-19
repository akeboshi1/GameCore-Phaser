import { op_client } from "pixelpai_proto";
import { Animation } from "../display/animation/animation";
import { IDragonbonesModel } from "../display/dragones/dragonbones.model";
import { FramesModel, IFramesModel } from "../display/frames/frames.model";

export class Effect extends Phaser.Events.EventEmitter {

    private mID: number;
    private mDisplayInfo: IFramesModel | IDragonbonesModel;
    constructor(id: number) {
        super();
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
            this.displayInfo = new FramesModel({
                animations: {
                    defaultAnimationName: sprite.currentAnimationName,
                    display,
                    animationData: anis,
                },
            });
        }
    }

    destroy() {
    }

    get id(): number {
        return this.mID;
    }

    set displayInfo(display: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = display;
        this.emit("updateDisplayInfo", display);
    }

    get displayInfo(): IFramesModel | IDragonbonesModel {
        return this.mDisplayInfo;
    }
}
