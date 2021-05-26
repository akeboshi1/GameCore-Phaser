import { ClickEvent } from "apowophaserui";
import { BaseGuide, UiManager } from "gamecoreRender";
import { PicaPartyNavigationPanel } from "picaRender";
import { ModuleName } from "structure";
import { PicaNewMainPanel } from "../PicaNewMain/PicaNewMainPanel";
import { PicaTaskPanel } from "../PicaTask/PicaTaskPanel";

export class BaseHotelFarmGuidePanel extends BaseGuide {
    protected mapButton;
    protected townToggle;
    constructor(uiManager: UiManager) {
        super(uiManager.render);
    }
    public show(param?: any) {
        super.show(param);
        this.step1();
    }

    public end() {
        this.render.emitter.off(PicaPartyNavigationPanel.PICAENTERROOM_DATA, this.end, this);
        super.end();
    }

    protected step1() {
        const main: PicaNewMainPanel = this.uiManager.getPanel(ModuleName.PICANEWMAIN_NAME) as PicaNewMainPanel;
        const leftPanel = main.leftPanel;
        this.mapButton = leftPanel.mapButton;
        const worldMatrix = (<any>this.mapButton).getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty },this.mData.guideText[0]);
        this.mapButton.on(ClickEvent.Tap, this.step2, this);
    }

    protected step2() {
        // 异步等待过程
        this.render.emitter.on(PicaPartyNavigationPanel.PICANAVIGATIONINIT_DATA, this.step3, this);
    }

    protected step3(pos) {
        this.mapButton.off(ClickEvent.Tap, this.step2, this);
        this.render.emitter.off(PicaPartyNavigationPanel.PICANAVIGATIONINIT_DATA, this.step3, this);
        this.render.emitter.on(PicaPartyNavigationPanel.PICATOWN_DATA, this.step4, this);
        const navPanel: PicaPartyNavigationPanel = this.uiManager.getPanel(ModuleName.PICAPARTYNAVIGATION_NAME) as PicaPartyNavigationPanel;
        this.townToggle = navPanel.getToggleButton(1);
        const worldMatrix = this.townToggle.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: this.townToggle.width, y: worldMatrix.ty },this.mData.guideText[2]);
    }

    protected step4() {
        this.render.emitter.off(PicaPartyNavigationPanel.PICATOWN_DATA, this.step4, this);
    }
}
