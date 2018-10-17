import {LayerManager} from './modules/uiManager/LayerManager';
import {LayoutManager} from './modules/uiManager/LayoutManager';
import {DataCenter} from "./modules/system/DataCenter";
import {Tool} from "./modules/system/Tool";
import {MessageCenter} from "./modules/system/MessageCenter";
import {TickManager} from "./modules/system/TickManager";
import {Room45Util} from "./modules/system/Room45Util";
import {SceneManager} from "./modules/system/SceneManager";

export default class Globals {
    private static _game:Phaser.Game;
    public static  set game(value:Phaser.Game) {
        this._game = value;
    }

    public  static  get game():Phaser.Game {
        return this._game;
    }

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
     * 消息处理中心
     */
    public static get MessageCenter(): MessageCenter {
        return MessageCenter.getInstance();
    }

    /**
     * 游戏工具
     */
    public static get Tool(): Tool
    {
        return Tool.getInstance();
    }

    /**
     * 全局计时器
     */
    public static get TickManager(): TickManager
    {
        return TickManager.getInstance();
    }

    /**
     * 地图工具
     */
    public static get Room45Util():Room45Util
    {
        return Room45Util.getInstance();
    }

    /**
     * 场景管理器
     */
    public static get SceneManager(): SceneManager {
        return SceneManager.getInstance();
    }

}