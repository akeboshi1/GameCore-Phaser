import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { IPos, Tool } from "utils";
export class PlaneGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager) {
        super(1441619821, uiManager);
    }

    protected step1(pos: IPos) {
        this.guideEffect.createGuideEffect(this.getGuidePosition());
        this.mPlayScene.input.on("gameobjectup", this.gameObjectUpHandler, this);
        //  this.scene.sys.events.on("update", this.updateGuidePos, this);
    }

    protected getGuidePosition() {
        if (!this.mElement) {
            this.mPlayScene.input.off("gameobjectup", this.gameObjectUpHandler, this);
            this.end();
            return;
        }
        const dpr = this.render.config.scale_ratio;
        const pos: IPos = Tool.getPosByScenes(this.mPlayScene, { x: this.mElement.x, y: this.mElement.y });
        const tmpPos = { x: pos.x + dpr * 120 - 100, y: pos.y + 1 * dpr };
        return tmpPos;
    }
}
