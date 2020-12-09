import { UiManager, Render, BasePanel, BasicScene } from "gamecoreRender";
import { AtlasManager } from "picaRes";
export class PicaRenderUiManager extends UiManager {

    protected mAtalsManager: AtlasManager;
    constructor(mRender: Render) {
        super(mRender);
        this.mAtalsManager = new AtlasManager();
        this.mAtalsManager.init(mRender);
    }

    public getAtlas(atlas: string[]) {
        return this.mAtalsManager.getAtalsArr(atlas);
    }
    protected _showPanel(type: string, param?: any): BasePanel {
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        let panel = this.mPanelMap.get(type);
        if (!panel) {
            const className: string = type + "Panel";
            const ns: any = require(`./${type}/${className}`);
            panel = new ns[className](this);
            if (!panel) {
                super._showPanel(type, param);
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mPanelMap.set(type, panel);
        }
        panel.show(param);
        return panel;
    }
}
