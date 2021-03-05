import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, Render, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { GuideID } from "../../guide";
import { BottomPanel } from "../Bottom/BottomPanel";
import { PicaBagPanel } from "../PicaBag/PicaBagPanel";

export class BagGuidePanel extends BaseGuide {
    constructor(uiManager: UiManager) {
        super(GuideID.Bag, uiManager.render);
    }

    public show() {
        this.step1();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        const button: Button = (<any>navigatePanel).bagButton;
        const worldMatrix = button.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        button.on(ClickEvent.Tap, () => {
            this.step2();
        }, this);
    }

    private step2() {
        // 异步等待过程
        this.render.emitter.on("BagPanel_show", () => {
            const bagPanel: PicaBagPanel = this.uiManager.getPanel(ModuleName.PICABAG_NAME) as PicaBagPanel;
            const closeBtn = bagPanel.closeBtn;
            const worldMatrix = closeBtn.getWorldTransformMatrix();
            this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
            closeBtn.on(ClickEvent.Tap, () => {
                this.end();
            }, this);
        }, this);
    }

}
