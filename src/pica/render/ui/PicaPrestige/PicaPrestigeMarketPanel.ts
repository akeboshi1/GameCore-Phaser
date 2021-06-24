import { UiManager } from "gamecoreRender";
import { PicaMarketPanel } from "picaRender";
import { ModuleName } from "structure";

export class PicaPrestigeMarketPanel extends PicaMarketPanel {
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPRESTIGE_NAME;
    }
    protected init() {
        super.init();
        this.moneycomp.visible = false;
    }
}
