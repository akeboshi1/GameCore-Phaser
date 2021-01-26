import { op_client } from "pixelpai_proto";
import { Game } from "src/game/game";
import { AnimationModel } from "structure";
import { DragonbonesModel, FramesModel } from "baseModel";
export class Effect {
    private mID: number;
    private mDisplayInfo: FramesModel | DragonbonesModel;
    constructor(private game: Game, private mOwnerID: number, id: number) {
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
        if (this.mDisplayInfo) {
            this.mDisplayInfo.destroy();
        }
        this.game.renderPeer.removeEffect(this.mID);
    }

    get id(): number {
        return this.mID;
    }

    set displayInfo(display: FramesModel | DragonbonesModel) {
        this.mDisplayInfo = display;
        if (display instanceof FramesModel) {
            this.game.renderPeer.addEffect(this.mOwnerID, this.mID, display);
        }
        this.game.emitter.emit("updateDisplayInfo", display);
    }

    get displayInfo(): FramesModel | DragonbonesModel {
        return this.mDisplayInfo;
    }
}
