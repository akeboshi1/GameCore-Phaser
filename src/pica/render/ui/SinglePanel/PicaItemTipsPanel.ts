import { UIAtlasName } from "picaRes";
import { ItemInfoTips, MainUIScene, UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaSingleManager } from "./PicaSingleManager";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
export class PicaItemTipsPanel extends PicaBasePanel {
    public static get Inst() {
        if (!this.mInstance) {
            this.mInstance = PicaSingleManager.createSinglePanel(PicaItemTipsPanel);
        }
        return this.mInstance;
    }
    private static mInstance: PicaItemTipsPanel;
    private itemTips: ItemInfoTips;
    constructor(uimgr: UiManager) {
        super(uimgr);
        this.atlasNames = [UIAtlasName.uicommon];
        this.key = ModuleName.PICAITEMTIPSPANEL_NAME;
        this.uiLayer = MainUIScene.LAYER_TOOLTIPS;
    }
    public showTips(gameobj: any, data: op_client.ICountablePackageItem) {
        if (!this.mInitialized) this.show({ gameobj, data });
        else this.displayTips(gameobj, data);
    }

    public destroy() {
        super.destroy();
        PicaItemTipsPanel.mInstance = undefined;
    }
    protected onShow() {
        if (!this.mShowData) return;
        const obj = this.mShowData;
        this.displayTips(obj.gameobj, obj.data);
    }
    protected init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.setSize(width, height);
        this.itemTips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasName.uicommon, "tips_bg", this.dpr);
        this.itemTips.setVisible(false);
        this.add(this.itemTips);
        super.init();
    }

    protected displayTips(gameobj: Phaser.GameObjects.Container, data: op_client.ICountablePackageItem) {
        this.itemTips.setVisible(true);
        this.itemTips.setItemData(data);
        this.setTipsPosition(gameobj, -gameobj.height * 0.5 - 5 * this.dpr);

    }
    private setTipsPosition(gameobject: Phaser.GameObjects.Container, offsety: number = 0) {
        const worldpos = gameobject.getWorldTransformMatrix();
        let tx = worldpos.tx / this.scale;
        let ty = worldpos.ty / this.scale;
        const tipsWidth = this.itemTips.width;
        const left = tipsWidth * 0.5 + 10 * this.dpr;
        const right = this.width - tipsWidth * 0.5 - 10 * this.dpr;
        if (tx < left) {
            tx = left;
        } else if (tx > right) {
            tx = right;
        }
        ty += offsety;
        this.itemTips.x = tx;
        this.itemTips.y = ty;
    }
}
