import { BaseGuide, UiManager } from "gamecoreRender";
import { PicaNewMainPanel } from "../PicaNewMain/PicaNewMainPanel";
import { ModuleName } from "structure";
import { ClickEvent } from "apowophaserui";

export class ActivityGuidePanel extends BaseGuide {
    constructor(uiManager: UiManager) {
        super(uiManager.render);
    }

    public show(param?: any) {
        super.show(param);
        this.step1();
    }

    private step1() {
        const mainPanel: PicaNewMainPanel = this.uiManager.getPanel(ModuleName.PICANEWMAIN_NAME) as PicaNewMainPanel;
        const activityPanel = mainPanel.activityPanel;
        const btn = activityPanel.arrowButton;
        const worldMatrix = btn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        btn.once(ClickEvent.Tap, this.end, this);
    }
}
