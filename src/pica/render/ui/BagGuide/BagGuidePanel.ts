import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, Render, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { GuideID } from "../../guide";
import { BottomPanel } from "../Bottom/BottomPanel";
import { PicaBagPanel } from "../PicaBag/PicaBagPanel";

export class BagGuidePanel extends BaseGuide {
    private bagBtn: Button;
    constructor(uiManager: UiManager) {
        super(GuideID.Bag, uiManager.render);
    }

    public show(param?: any) {
        super.show(param);
        this.step1();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        this.bagBtn = (<any>navigatePanel).bagButton;
        const worldMatrix = this.bagBtn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        this.bagBtn.on(ClickEvent.Tap, this.bagBtnHandler, this);
    }

    private step2() {
        // 异步等待过程
        this.render.emitter.on("BagPanel_show", this.bagShowHandler, this);
    }

    private bagBtnHandler() {
        this.bagBtn.off(ClickEvent.Tap, this.bagBtnHandler, this);
        this.step2();
    }

    private bagShowHandler() {
        this.render.emitter.off("BagPanel_show", this.bagShowHandler, this);
        const bagPanel: PicaBagPanel = this.uiManager.getPanel(ModuleName.PICABAG_NAME) as PicaBagPanel;
        const closeBtn = bagPanel.closeBtn;
        const worldMatrix = closeBtn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        closeBtn.on(ClickEvent.Tap, () => {
            this.end();
        }, this);
    }

}
