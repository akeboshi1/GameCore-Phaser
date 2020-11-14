import { UiManager, Render, BasePanel, BasicScene } from "gamecoreRender";
export class PicaRenderUiManager extends UiManager {
    constructor(mRender: Render) {
        super(mRender);
    }

    protected _showPanel(type: string, param?: any): BasePanel {
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        const className: string = type + "Panel";
        const ns: any = require(`./${type}/${className}`);
        const panel = new ns[className](this);
        if (!panel) {
            super._showPanel(type, param);
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        this.mPanelMap.set(type + "Panel", panel);
        panel.show(param);
        return panel;
    }
}
