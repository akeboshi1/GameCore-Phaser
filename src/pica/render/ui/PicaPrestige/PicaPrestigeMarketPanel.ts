import { UiManager } from "gamecoreRender";
import { PicaMarketPanel } from "picaRender";
import { UIAtlasName } from "picaRes";
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
    }
    public hide() {
        this.mShow = false;
        this.visible = false;
    }
    protected init() {
        super.init();
        this.moneycomp.visible = false;
        this.mCloseBtn.visible = false;
        this.imgBg.setTexture(this.atlas, "prestige_bg_texture");
        this.scale = 1;
    }
}
