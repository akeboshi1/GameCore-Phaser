import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, Render, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { GuideID } from "../../guide";
import { BottomPanel } from "../Bottom/BottomPanel";

export class HomeGuidePanel extends BaseGuide {
    constructor(uiManager: UiManager) {
        super(GuideID.Home, uiManager.render);
    }

    public show(param?: any) {
        super.show(param);
        this.step1();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        const button: Button = (<any>navigatePanel).homeButton;
        const worldMatrix = button.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        button.on(ClickEvent.Tap, () => {
            this.end();
        }, this);
    }
}
