import { BaseGuide, UiManager } from "gamecoreRender";
import { GuideID } from "../../guide";

export class TreasureGuidePanel extends BaseGuide {
    constructor(uiManager: UiManager) {
        super(GuideID.Plane, uiManager.render);
        // this.playScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
    }
}
