import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { IPos, Tool } from "utils";
export class RoomGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager) {
        super(1589349967, uiManager);
    }

    protected step1(pos: IPos) {
        this.guideEffect.createGuideEffect(this.getGuidePosition(),this.mData.guideText[0]);
        this.mPlayScene.input.on("gameobjectup", this.gameObjectUpHandler, this);
        // this.scene.sys.events.on("update", this.updateGuidePos, this);
    }

    protected getGuidePosition() {
        if (!this.mElement) {
            this.mPlayScene.input.off("gameobjectup", this.gameObjectUpHandler, this);
            this.end();
            return;
        }
        const dpr = this.render.config.scale_ratio;
        const pos: IPos = Tool.getPosByScenes(this.mPlayScene, { x: this.mElement.x, y: this.mElement.y });
        const tmpPos = { x: pos.x - dpr * 5, y: pos.y + 95 * dpr };
        return tmpPos;
    }
}
