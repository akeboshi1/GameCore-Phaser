import { ClickEvent } from "apowophaserui";
import { UiManager } from "gamecoreRender";
import { PicaMyNavigationPanel, PicaPartyNavigationPanel, PicaTaskPanel } from "../..";
import { ModuleName } from "structure";
import { BaseHotelMineGuidePanel } from "./BaseHotelMineGuidePanel";
export class HotelMineGuidePanel extends BaseHotelMineGuidePanel {

    constructor(uiManager: UiManager) {
        super(uiManager);
    }

    public end() {
        this.render.emitter.off(PicaPartyNavigationPanel.PICAENTERROOM_DATA, this.end, this);
        this.render.emitter.off(PicaPartyNavigationPanel.PicaPartyNavigationPanel_CLOSE, this.end, this);
        super.end();
    }

    protected step4() {
        this.render.emitter.off(PicaPartyNavigationPanel.PICATOWN_DATA, this.step4, this);
        const navPanel: PicaPartyNavigationPanel = this.uiManager.getPanel(ModuleName.PICAPARTYNAVIGATION_NAME) as PicaPartyNavigationPanel;
        const mapItem = navPanel.mineMapItem;
        const worldMatrix = mapItem.getWorldTransformMatrix();
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty },this.mData.guideText[3]);
        this.render.emitter.on(PicaPartyNavigationPanel.PICAENTERROOM_DATA, this.end, this);
    }
}