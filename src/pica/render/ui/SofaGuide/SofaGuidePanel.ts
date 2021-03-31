import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { IPos } from "utils";
export class SofaGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager) {
        super(1589349967, uiManager);
    }

    protected step1(pos: IPos) {
        const dpr = this.render.config.scale_ratio;
        const tmpPos = { x: pos.x - dpr * 10, y: pos.y + 70 * dpr };
        this.guideEffect.createGuideEffect(tmpPos);
        this.mPlayScene.input.on("gameobjectdown", this.gameObjectUpHandler, this);
    }
}