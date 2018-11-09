import {ModuleManager} from "./managers/system/ModuleManager";
import {LayerManager} from "./managers/uiManager/LayerManager";
import {KeyboardMod} from "./managers/system/KeyboardMod";
import {LayoutManager} from "./managers/uiManager/LayoutManager";
import {MessageCenter} from "./managers/system/MessageCenter";
import {DataCenter} from "./managers/system/DataCenter";
import {Tool} from "./managers/system/Tool";
import {TickManager} from "./managers/system/TickManager";
import {Room45Util} from "./managers/system/Room45Util";
import {SceneManager} from "./managers/system/SceneManager";

export default class Globals {
    private static _game: Phaser.Game;
    public static  set game(value: Phaser.Game) {
        this._game = value;
    }

    public  static  get game(): Phaser.Game {
        return this._game;
    }

    /**
     * 图层管理器
     */
    public static get ModuleManager(): ModuleManager {
        return ModuleManager.getInstance();
    }

    /**
     * 图层管理器
     */
    public static get LayerManager(): LayerManager {
        return LayerManager.getInstance();
    }

    /**
     * 键盘工具
     */
    public static get Keyboard(): KeyboardMod {
        return KeyboardMod.getInstance();
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
    public static get DataCenter(): DataCenter {
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
    public static get Tool(): Tool {
        return Tool.getInstance();
    }

    /**
     * 全局计时器
     */
    public static get TickManager(): TickManager {
        return TickManager.getInstance();
    }

    /**
     * 地图工具
     */
    public static get Room45Util(): Room45Util {
        return Room45Util.getInstance();
    }

    /**
     * 场景管理器
     */
    public static get SceneManager(): SceneManager {
        return SceneManager.getInstance();
    }

}