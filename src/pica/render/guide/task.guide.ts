import { Button, ClickEvent } from "apowophaserui";
import { BaseGuide, ButtonEventDispatcher, Render } from "gamecoreRender";
import { ModuleName } from "structure";
import { BottomPanel, PicaExploreListPanel } from "../ui";

export class TaskGuide extends BaseGuide {
    constructor(id: number, render: Render) {
        super(id, render);
    }

    public start() {
        this.step1();
    }

    public stop() {
        this.guideEffect.destroy();
    }

    private step1() {
        const bottom: BottomPanel = this.uiManager.getPanel(ModuleName.BOTTOM) as BottomPanel;
        const navigatePanel = bottom.navigatePanel;
        const button: Button = (<any>navigatePanel).exploreButton;
        this.guideEffect.createGuideEffect({ x: button.x, y: button.y });
        button.on(ClickEvent.Tap, () => {
            this.step2();
        }, this);
    }

    private step2() {
        const exploreListPanel: PicaExploreListPanel = this.uiManager.getPanel(ModuleName.PICAEXPLORELIST_NAME) as PicaExploreListPanel;
        const picaExploreListBottomPanel: any = exploreListPanel.bottomPanel;
        const list: any[] = picaExploreListBottomPanel.chapterItems;
        const item: ButtonEventDispatcher = list[0] as ButtonEventDispatcher;
        item.on(ClickEvent.Tap, () => {
            this.stop();
        }, this);
    }
}
