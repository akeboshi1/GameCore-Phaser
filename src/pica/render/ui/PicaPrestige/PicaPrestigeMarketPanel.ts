import { UiManager } from "gamecoreRender";
import { PicaMarketPanel } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ICurrencyLevel } from "picaStructure";
import { ModuleName } from "structure";
import { Handler } from "utils";

export class PicaPrestigeMarketPanel extends PicaMarketPanel {
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPRESTIGE_NAME;
        this.loadAtlas = undefined;
        this.textures = undefined;
        this.zoom = this.mWorld.uiScale;
        this.mSuperInit = false;
        this.init();
    }

    public show() {
        this.mShow = true;
        this.mInitialized = true;
        this.visible = true;
        this.addListen();
    }
    public hide() {
        this.mShow = false;
        this.visible = false;
        this.removeListen();
    }
    protected init() {
        super.init();
        this.moneycomp.visible = false;
        this.mCloseBtn.visible = false;
        this.tileBg.visible = false;
        this.imgBg.visible = true;
        this.imgBg.setTexture(UIAtlasName.prestige, "prestige_bg_texture(1)");
        this.scale = 1;
    }
}
