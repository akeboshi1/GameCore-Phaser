import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, Render } from "gamecoreRender";
import { ModuleName } from "structure";
import { BottomPanel } from "../Bottom/BottomPanel";
import { PicaBagPanel } from "../PicaBag/PicaBagPanel";

export class BagGuide extends BaseGuide {
    constructor(id: number, render: Render) {
        super(id, render);
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
        const bagPanel: PicaBagPanel = this.uiManager.getPanel(ModuleName.PICABAG_NAME) as PicaBagPanel;
        this.render.emitter.on("BagPanel_show", () => {
            const closeBtn = bagPanel.closeBtn;
            closeBtn.on(ClickEvent.Tap, () => {
                this.end();
            }, this);
        }, this);
    }

}
