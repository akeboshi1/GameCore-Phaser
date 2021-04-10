import { ValueResolver } from "utils";
import { Render } from "../render";
import { BasePanel } from "./components/base.panel";
import { BasicScene } from "baseRender";
import { Panel } from "apowophaserui";
export declare class UiManager {
    protected mRender: Render;
    protected mScene: BasicScene;
    protected mPanelMap: Map<string, BasePanel>;
    protected mBatchPanelList: Panel[];
    /**
     * 前端触发显示ui缓存列表
     */
    protected mCache: any[];
    protected mRemoteCache: Map<string, {
        resolver: ValueResolver<BasePanel>;
        param?: any;
    }>;
    constructor(mRender: Render);
    setScene(scene: BasicScene): void;
    resize(width: number, height: number): void;
    setPanel(value: string, panel: BasePanel): void;
    getPanel(type: string): BasePanel | undefined;
    clearPanel(): void;
    showAlertView(text: string, ok: boolean, cancel?: boolean, callBack?: Function): void;
    /**
     * 创建批量显示面板
     * @param type
     * @param param
     */
    showBatchPanel(type: string, param?: any): BasePanel;
    destroy(): void;
    showPanel(type: string, param?: any): Promise<BasePanel>;
    hidePanel(type: string): void;
    /**
     * 客户端发起关闭界面
     * @param type
     */
    hideBasePanel(type: string): BasePanel;
    /**
     * 关闭批量界面，因为批量界面class一致，无法通过服务器告知关闭，所以由客户端控制开关（由panel的hide发起方法调用）
     * @param panel
     */
    hideBatchPanel(panel: Panel): void;
    closePanel(id: number): void;
    updateUIState(type: string, ui: any): void;
    protected getPanelClass(type: string): any;
    get scene(): BasicScene;
    get render(): Render;
    protected clearCache(): void;
    protected _showPanel(type: string, param?: any): BasePanel;
}
