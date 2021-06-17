import { UIAtlasName } from "../../../res";
import { ItemInfoTips, MainUIScene, UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaSingleManager } from "./PicaSingleManager";
import { ModuleName } from "structure";
import { ICountablePackageItem } from "../../../structure";
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
        this.loadAtlas = [UIAtlasName.uicommon];
        this.key = ModuleName.PICAITEMTIPSPANEL_NAME;
        this.uiLayer = MainUIScene.LAYER_TOOLTIPS;
    }
    /**
     *
     * @param gameobj 显示的物体对象
     * @param data 道具数据
     * @param eventType 关闭tips监听事件类型
     */
    public showTips(gameobj: any, data: ICountablePackageItem, eventType?: string) {
        if (!this.mInitialized) this.show({ gameobj, data, eventType });
        else this.displayTips(gameobj, data, eventType);
    }

    public destroy() {
        super.destroy();
        PicaItemTipsPanel.mInstance = undefined;
    }
    protected onShow() {
        if (!this.mShowData) return;
        const obj = this.mShowData;
        this.displayTips(obj.gameobj, obj.data, obj.eventType);
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

    protected displayTips(gameobj: Phaser.GameObjects.Container, data: ICountablePackageItem, eventType?: string) {
        this.itemTips.setListenType(eventType);
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
