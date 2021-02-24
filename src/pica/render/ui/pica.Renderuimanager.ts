import { UiManager, Render, BasePanel } from "gamecoreRender";
import { AtlasData, AtlasManager, UILoadType } from "picaRes";
import { PicaSingleManager } from "./SinglePanel/PicaSingleManager";
export class PicaRenderUiManager extends UiManager {
    protected mAtalsManager: AtlasManager;
    protected singleManager: PicaSingleManager;
    constructor(mRender: Render) {
        super(mRender);
        this.mAtalsManager = new AtlasManager();
        this.singleManager = new PicaSingleManager(this);
        this.mAtalsManager.init(mRender);
    }

    public getUrlDatas(atlas: Array<string | AtlasData>, loadType: UILoadType = UILoadType.atlas) {
        return this.mAtalsManager.getUrlDatas(atlas, loadType);
    }

    public showAlertView(text: string, ok: boolean, cancel: boolean = false, callBack?: Function) {
        super.showAlertView(text, ok, cancel, callBack);
    }

    public destroy() {
        super.destroy();
        this.singleManager.destroy();
    }
    protected _showPanel(type: string, param?: any): BasePanel {
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        const className: string = type + "Panel";
        const ns: any = require(`./${type}/${className}`);
        let panel = this.mPanelMap.get(type);
        if (!panel) {
            panel = new ns[className](this);
            this.mPanelMap.set(type, panel);
        }
        panel.show(param);
        return panel;
    }

}
