import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, Render } from "gamecoreRender";
import { ModuleName } from "structure";
import { BottomPanel } from "../Bottom/BottomPanel";
import { PicaExploreListPanel } from "../PicaExploreList/PicaExploreListPanel";

export class ExploreGuide extends BaseGuide {
    constructor(id: number, render: Render) {
        super(id, render);
    }

    public show() {
        this.step1();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        const button: Button = (<any>navigatePanel).exploreButton;
        const worldMatrix = button.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        button.on(ClickEvent.Tap, () => {
            this.step2();
        }, this);
    }

    private step2() {
        // 异步等待过程
        this.render.emitter.once("PicaExploreListPanel_Data", (addHei) => {
            const exploreListPanel: PicaExploreListPanel = this.uiManager.getPanel(ModuleName.PICAEXPLORELIST_NAME) as PicaExploreListPanel;
            const picaExploreListLevelPanel: any = exploreListPanel.levelPanel;
            const list: any[] = picaExploreListLevelPanel.levelItems;
            const item = list[0];
            const worldMatrix = item.openButton.getWorldTransformMatrix();
            this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty + addHei });
            item.on(ClickEvent.Tap, () => {
                this.end();
            }, this);
        }, this);
    }
}