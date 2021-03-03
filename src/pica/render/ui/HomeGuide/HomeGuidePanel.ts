import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, Render } from "gamecoreRender";
import { ModuleName } from "structure";
import { BottomPanel } from "../Bottom/BottomPanel";

export class HomeGuide extends BaseGuide {
    constructor(id: number, render: Render) {
        super(id, render);
    }

    public show() {
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
