import { UiManager, Render, BasePanel } from "gamecoreRender";
import { Logger } from "utils";
export class PicaRenderUiManager extends UiManager {
    constructor(mRender: Render) {
        super(mRender);
    }
    public showPanel(type: string, param?: any) {
        if (!this.mScene) {
            const scene = this.render.sceneManager.currentScene;
            if (!scene) return;
            scene.scene.launch("MainUIScene");
            this.mCache.push(param);
            this.mCacheUI = this.showPanel;
            return;
        }
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        // type = this.getPanelNameByAlias(type);
        const className: string = type + "Panel";
        // let panel: BasePanel = this.mPanelMap.get(className);
        // if (!panel) {
        // const path: string = `./${type}/${type}Panel`;
        let ns: any = require(`./${type}/${className}`);
        if (!ns) {
            ns = this.getPanelClass(type);
        }
        const panel = new ns[className](this);
        if (!panel) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        this.mPanelMap.set(type + "Panel", panel);
        //     // mediator.setName(type);
        // }
        // // if (mediator.showing) return;
        // if (param) mediator.setParam(param);
        panel.show(param);
        return panel;
    }
}
