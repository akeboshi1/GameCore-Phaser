import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { BottomPanel } from "../Bottom/BottomPanel";
import { PicaBagPanel } from "../PicaBag/PicaBagPanel";

export class BagGuidePanel extends BaseGuide {
    private bagBtn: Button;
    private clsBtn;
    constructor(uiManager: UiManager) {
        super(uiManager.render);
    }

    public show(param?: any) {
        super.show(param);
        this.step1();
    }
    public end() {
        if (this.clsBtn) this.clsBtn.off(ClickEvent.Tap, this.end, this);
        super.end();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        this.bagBtn = (<any>navigatePanel).bagButton;
        const worldMatrix = this.bagBtn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        this.bagBtn.on(ClickEvent.Tap, this.step2, this);
    }

    private step2() {
        // 异步等待过程
        this.render.emitter.on(PicaBagPanel.PICABAG_SHOW, this.step3, this);
        this.bagBtn.off(ClickEvent.Tap, this.step2, this);
    }

    private step3() {
        this.render.emitter.off(PicaBagPanel.PICABAG_SHOW, this.step3, this);
        const bagPanel: PicaBagPanel = this.uiManager.getPanel(ModuleName.PICABAG_NAME) as PicaBagPanel;
        this.clsBtn = bagPanel.closeBtn;
        const worldMatrix = this.clsBtn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        this.clsBtn.on(ClickEvent.Tap, this.end, this);
    }

}
