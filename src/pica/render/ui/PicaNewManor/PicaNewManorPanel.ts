import { UiManager } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { PicaBasePanel } from "../pica.base.panel";
import { CommonBackground } from "..";
export class PicaPrestigePanel extends PicaBasePanel {
    private mBackground: CommonBackground;
    private redObj: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPRESTIGE_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.manor_new];
        this.tempDatas = {};
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        this.mBackground.x = w * 0.5;
        this.mBackground.y = h * 0.5;
        super.resize(w, h);
        this.setSize(w, h);
    }

    init() {
        const width = this.scaleWidth, height = this.scaleHeight;
        this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
        this.add(this.mBackground);
        this.resize();
        super.init();
    }

    onShow() {

    }

    setRedsState(obj: any) {
        this.redObj = obj;
        if (!this.mInitialized) return;

    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
}
