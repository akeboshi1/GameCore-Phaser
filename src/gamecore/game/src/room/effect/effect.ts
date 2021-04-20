import { op_client } from "pixelpai_proto";
import { Game } from "../../game";
import { AnimationModel,Helpers } from "structure";
import { DragonbonesModel, FramesModel } from "basemodel";
export class Effect {
    /**
     * 同类型显示对象共用一个。用于同步数据
     */
    private mBindId: number;

    /**
     * 唯一。客户端生成。避免和其他人物身上特效冲突
     */
    private mId: number;
    private mDisplayInfo: FramesModel | DragonbonesModel;
    constructor(private game: Game, private mOwnerID: number, bindId: number) {
        this.mBindId = bindId;
        this.mId = Helpers.genId();
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
        this.game.renderPeer.removeEffect(this.mOwnerID, this.mId);
    }

    get bindId(): number {
        return this.mBindId;
    }

    set displayInfo(display: FramesModel | DragonbonesModel) {
        this.mDisplayInfo = display;
        if (display instanceof FramesModel) {
            this.game.renderPeer.addEffect(this.mOwnerID, this.mId, display);
        }
        this.game.emitter.emit("updateDisplayInfo", display);
    }

    get displayInfo(): FramesModel | DragonbonesModel {
        return this.mDisplayInfo;
    }
}
