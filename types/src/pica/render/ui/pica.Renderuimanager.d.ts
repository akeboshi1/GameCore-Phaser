import { UiManager, Render, BasePanel } from "gamecoreRender";
import { AtlasData, AtlasManager, UILoadType } from "../../res";
import { PicaSingleManager } from "./SinglePanel/PicaSingleManager";
export declare class PicaRenderUiManager extends UiManager {
    protected mAtalsManager: AtlasManager;
    protected singleManager: PicaSingleManager;
    private mCachePanelMap;
    constructor(mRender: Render);
    getUrlDatas(atlas: Array<string | AtlasData>, loadType?: UILoadType): import("../../res").AtlasUrlData[];
    showAlertView(text: string, ok: boolean, cancel?: boolean, callBack?: Function): void;
    destroy(): void;
    protected _showPanel(type: string, param?: any): BasePanel;
    private sceneCreated;
    private sceneDestroy;
}
