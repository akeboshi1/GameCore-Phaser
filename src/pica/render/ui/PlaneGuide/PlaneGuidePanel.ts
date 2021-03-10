import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { IPos } from "utils";
export class PlaneGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager) {
        super(1441619821, uiManager);
    }

    protected step1(pos: IPos) {
        const tmpPos = { x: pos.x + 370, y: pos.y + 350 };
        this.guideEffect.createGuideEffect(tmpPos);
        this.mPlayScene.input.on("gameobjectdown", this.gameObjectDownHandler, this);
    }
}
