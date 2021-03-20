import { ClickEvent } from "apowophaserui";
import { BaseGuide, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { PicaNewMainPanel } from "../PicaNewMain/PicaNewMainPanel";
import { PicaTaskPanel } from "../PicaTask/PicaTaskPanel";

export class HotelGuidePanel extends BaseGuide {
    private taskButton;
    private itemTaskBtn;
    constructor(uiManager: UiManager) {
        super(uiManager.render);
    }
    public show(param?: any) {
        super.show(param);
        this.step1();
    }

    public end() {
        if (this.itemTaskBtn) this.itemTaskBtn.off(ClickEvent.Tap, this.end, this);
        this.render.emitter.off("close_panel", this.end, this);
        super.end();
    }

    private step1() {
        const main: PicaNewMainPanel = this.uiManager.getPanel(ModuleName.PICANEWMAIN_NAME) as PicaNewMainPanel;
        const leftPanel = main.leftPanel;
        this.taskButton = leftPanel.taskButton;
        const worldMatrix = (<any>this.taskButton).getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        this.taskButton.on(ClickEvent.Tap, this.step2, this);
    }

    private step2() {
        // 异步等待过程
        this.render.emitter.on(PicaTaskPanel.PICATASK_DATA, this.step3, this);
    }

    private step3(pos) {
        this.taskButton.off(ClickEvent.Tap, this.step2, this);
        this.render.emitter.off(PicaTaskPanel.PICATASK_DATA, this.step3, this);
        this.render.emitter.on("close_panel", this.end, this);
        const taskPanel: PicaTaskPanel = this.uiManager.getPanel(ModuleName.PICATASK_NAME) as PicaTaskPanel;
        const picaMainTaskPanel: any = taskPanel.mainPanel;
        const list: any[] = picaMainTaskPanel.taskItems;
        const item = list[0];
        if (!item) this.end();
        this.itemTaskBtn = item.taskButton;
        const worldMatrix = this.itemTaskBtn.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: item.width - 30 * this.render.uiRatio, y: worldMatrix.ty });
        this.itemTaskBtn.on(ClickEvent.Tap, this.end, this);
    }

}
