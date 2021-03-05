import { ClickEvent } from "apowophaserui";
import { BaseGuide, Render } from "gamecoreRender";
import { ModuleName } from "structure";
import { PicaNewMainPanel } from "../PicaNewMain/PicaNewMainPanel";
import { PicaTaskPanel } from "../PicaTask/PicaTaskPanel";

export class HotelGuide extends BaseGuide {
    constructor(id: number, render: Render) {
        super(id, render);
    }
    public show() {
        this.step1();
    }

    private step1() {
        const main: PicaNewMainPanel = this.uiManager.getPanel(ModuleName.PICANEWMAIN_NAME) as PicaNewMainPanel;
        const leftPanel = main.leftPanel;
        const btn = leftPanel.taskButton;
        const worldMatrix = (<any>btn).getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        btn.on(ClickEvent.Tap, () => {
            this.step2();
        }, this);
    }

    private step2() {
        // 异步等待过程
        this.render.emitter.once("PicaTaskPanel_Data", (pos) => {
            const taskPanel: PicaTaskPanel = this.uiManager.getPanel(ModuleName.PICATASK_NAME) as PicaTaskPanel;
            const picaMainTaskPanel: any = taskPanel.mainPanel;
            const list: any[] = picaMainTaskPanel.taskItems;
            const item = list[0];
            if (!item) this.end();
            const taskButton = item.taskButton;
            const worldMatrix = taskButton.getWorldTransformMatrix();
            this.guideEffect.createGuideEffect({ x: item.width, y: worldMatrix.ty });
            taskButton.on(ClickEvent.Tap, () => {
                this.end();
            }, this);
        }, this);
    }

}
