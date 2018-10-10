import {LayerManager} from './modules/uiManager/LayerManager';
import {LayoutManager} from './modules/uiManager/LayoutManager';
import {DataCenter} from "./modules/system/DataCenter";
import {Res} from "./modules/system/Res";

export class Globals {
    /**
     * 图层管理器
     */
    public static get LayerManager(): LayerManager {
        return LayerManager.getInstance();
    }

    /**
     * 布局管理器
     */
    public static get LayoutManager(): LayoutManager {
        return LayoutManager.getInstance();
    }

    /**
     * 数据中心
     */
    public static get DataCenter(): DataCenter
    {
        return DataCenter.getInstance();
    }

    /**
     * 资源中心
     */
    public static get Res(): Res
    {
        return Res.getInstance();
    }

}