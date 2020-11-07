import { op_client } from "pixelpai_proto";
import { Game } from "src/game/game";
import { AnimationModel } from "../display/animation/animation.model";
import { DragonbonesModel } from "../display/dragones/dragonbones.model";
import { FramesModel } from "../display/frames/frames.model";

export class Effect {
    private mID: number;
    private mDisplayInfo: FramesModel | DragonbonesModel;
    constructor(private game: Game, id: number) {
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
                anis.push(new AnimationModel(ani));
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

    set displayInfo(display: FramesModel | DragonbonesModel) {
        this.mDisplayInfo = display;
        this.game.emitter.emit("updateDisplayInfo", display);
    }

    get displayInfo(): FramesModel | DragonbonesModel {
        return this.mDisplayInfo;
    }
}
