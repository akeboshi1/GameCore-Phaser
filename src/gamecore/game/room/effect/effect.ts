import { Game } from "../../game";
import { DragonbonesModel, FramesModel } from "baseGame";
import { Helpers } from "utils";
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

    updateDisplayInfo(frameModel: FramesModel) {
        this.displayInfo = frameModel;
    }

    destroy() {
        this.game.renderPeer.removeEffect(this.mOwnerID, this.mId);
        this.mDisplayInfo = null;
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
