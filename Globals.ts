import {ModuleManager} from "./common/manager/ModuleManager";
import {LayerManager} from "./common/manager/LayerManager";
import {KeyboardMod} from "./common/manager/KeyboardMod";
import {LayoutManager} from "./common/manager/LayoutManager";
import {MessageCenter} from "./common/manager/MessageCenter";
import {DataCenter} from "./common/manager/DataCenter";
import {Tool} from "./common/manager/Tool";
import {TickManager} from "./common/manager/TickManager";
import {Scene45Util} from "./common/manager/Scene45Util";
import {SceneManager} from "./common/manager/SceneManager";
import {SocketManager} from "./common/manager/SocketManager";
import {ServiceCenter} from "./common/manager/ServiceCenter";
import {SoundManager} from "./common/manager/SoundManager";
import {MouseMod} from "./common/manager/MouseMod";
import {PromptManager} from "./common/manager/PromptManager";
import {ObjectPoolManager} from "./common/manager/ObjectPoolManager";

export default class Globals {
  private static _game: Phaser.Game;

  public static get game(): Phaser.Game {
    return this._game;
  }

  public static set game(value: Phaser.Game) {
    this._game = value;
  }

  /**
   * socket
   */
  public static get SocketManager(): SocketManager {
    return SocketManager.getInstance();
  }

  /**
   * sound
   */
  public static get SoundManager(): SoundManager {
    return SoundManager.getInstance();
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
   * 鼠标工具
   */
  public static get MouseMod(): MouseMod {
    return MouseMod.getInstance();
  }


  /**
   * 布局管理器
   */
  public static get LayoutManager(): LayoutManager {
    return LayoutManager.getInstance();
  }

  /**
   * 提示管理器
   */
  public static get PromptManager(): PromptManager {
    return PromptManager.getInstance();
  }

  /**
   * 数据中心
   */
  public static get DataCenter(): DataCenter {
    return DataCenter.getInstance();
  }

  /**
   * 通讯中心
   * @constructor
   */
  public static get ServiceCenter(): ServiceCenter {
    return ServiceCenter.getInstance();
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
  public static get Room45Util(): Scene45Util {
    return Scene45Util.getInstance();
  }

  /**
   * 场景管理器
   */
  public static get SceneManager(): SceneManager {
    return SceneManager.getInstance();
  }

  /**
   * 对象池管理
   */
  public static get ObjectPoolManager(): ObjectPoolManager {
    return ObjectPoolManager.getInstance();
  }

}
