import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { IPos } from "utils";
export class PlaneGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager) {
        super(1441619821, uiManager);
    }

    protected step1(pos: IPos) {
        const dpr = this.render.config.scale_ratio;
        const tmpPos = { x: pos.x + dpr * 120 - 100, y: pos.y + 1 * dpr };
        this.guideEffect.createGuideEffect(tmpPos);
        this.mPlayScene.input.on("gameobjectup", this.gameObjectUpHandler, this);
    }
}
