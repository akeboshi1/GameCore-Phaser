import {LayerManager} from './modules/uiManager/LayerManager';
import {LayoutManager} from './modules/uiManager/LayoutManager';

export class App {
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

}