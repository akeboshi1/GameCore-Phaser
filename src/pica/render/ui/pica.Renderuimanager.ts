import { UiManager, Render, BasePanel } from "gamecoreRender";
import { AtlasData, AtlasManager, UILoadType } from "picaRes";
import { PicaSingleManager } from "./SinglePanel/PicaSingleManager";
export class PicaRenderUiManager extends UiManager {
    protected mAtalsManager: AtlasManager;
    protected singleManager: PicaSingleManager;
    private mCachePanelMap: Map<string, any>;
    constructor(mRender: Render) {
        super(mRender);
        this.mAtalsManager = new AtlasManager();
        this.singleManager = new PicaSingleManager(this);
        this.mAtalsManager.init(mRender);
        this.mRender.emitter.on(Render.SCENE_CREATED, this.sceneCreated);
        this.mRender.emitter.on(Render.SCENE_DESTROY, this.sceneDestroy);
    }

    public getUrlDatas(atlas: Array<string | AtlasData>, loadType: UILoadType = UILoadType.atlas) {
        return this.mAtalsManager.getUrlDatas(atlas, loadType);
    }

    public showAlertView(text: string, ok: boolean, cancel: boolean = false, callBack?: Function) {
        super.showAlertView(text, ok, cancel, callBack);
    }

    public destroy() {
        super.destroy();
        this.mRender.emitter.off(Render.SCENE_CREATED, this.sceneCreated);
        this.mRender.emitter.off(Render.SCENE_DESTROY, this.sceneDestroy);
        this.singleManager.destroy();
    }
    protected _showPanel(type: string, param?: any): BasePanel {
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        if (!this.mCachePanelMap) {
            this.mCachePanelMap = new Map();
        }
        const className: string = type + "Panel";
        const ns: any = require(`./${type}/${className}`);
        let panel = this.mPanelMap.get(type);
        if (!panel) {
            panel = new ns[className](this);
            this.mPanelMap.set(type, panel);
            this.mCachePanelMap.set(type, { panel, param });
        }
        // 场景未创建完成，不做show
        if (!this.sceneCreated) return panel;
        panel.show(param);
        return panel;
    }

    private sceneCreated() {
        if (!this.mCachePanelMap) return;
        this.mCachePanelMap.forEach((val) => {
            const panel = val.panel;
            const param = val.param;
            panel.show(param);
        });
    }

    private sceneDestroy() {
    }

}
