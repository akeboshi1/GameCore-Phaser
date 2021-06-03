import {  ClickEvent } from "apowophaserui";
import { BaseGuide, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { BottomPanel } from "../Bottom/BottomPanel";

export class HomeGuidePanel extends BaseGuide {
    private homeBtn;
    constructor(uiManager: UiManager) {
        super(uiManager.render);
    }

    public show(param?: any) {
        super.show(param);
        this.step1();
    }

    public end() {
        if (this.homeBtn) this.homeBtn.off(ClickEvent.Tap, this.end, this);
        super.end();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        this.homeBtn = (<any>navigatePanel).homeButton;
        const worldMatrix = this.homeBtn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty },this.mData.guideText[0]);
        this.homeBtn.on(ClickEvent.Tap, this.end, this);
    }
}
