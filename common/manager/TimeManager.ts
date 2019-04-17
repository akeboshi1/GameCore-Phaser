import BaseSingleton from "../../base/BaseSingleton";
import {Tick} from "../tick/Tick";
import {ClockInfo} from "../struct/ClockInfo";
import {HashMap} from "../../base/ds/HashMap";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";

export class TimeManager extends BaseSingleton {
  private mTick: Tick;
  private mInitilized = false;
  protected serverTime = 0;
  protected now = 0;
  protected m_ClockList: HashMap = new HashMap();
  public constructor() {
    super();
  }

  public get initilized(): boolean {
    return this.mInitilized;
  }

  public init(): void {
    let tempNow = new Date().getTime(); // todo:临时
    this.setServerTime(tempNow);
    this.mTick = new Tick(60);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.setRenderCallBack(this.onFrame, this);
    this.mTick.start();
    this.mInitilized = true;
  }

  /**
   * 设置服务器当前时间。 毫秒数
   * @return
   */
  public setServerTime(value: number): void {
    this.serverTime = value;
    this.now = new Date().getTime();
  }

  /**
   * 获取当前时间。 毫秒数
   * @return
   */
  public getCurrentTime(): number {
    let d: number = new Date().getTime() - this.now;
    return this.serverTime + d;
  }

  public addClock(value: ClockInfo): void {
    if (value == null) {
      return;
    }
    if (this.m_ClockList.has(value.m_ID)) {
      return;
    }
    if (value.m_Count === 0) {
      return;
    }
    this.m_ClockList.add(value.m_ID, value);
  }

  public clearClock(value: number): boolean {
    if (this.m_ClockList.has(value)) {
      this.m_ClockList.remove(value);
      return true;
    }
    return false;
  }

  public isClockEnd(value: number): boolean {
    return !this.m_ClockList.has(value);
  }

  public getClockCount(value: number): number {
    let info: ClockInfo = this.m_ClockList.getValue(value);
    if (info) {
      return info.m_Count;
    }
    return 0;
  }

  public onTick(deltaTime: number): void {
    let len = this.m_ClockList.valueList.length;
    let info: ClockInfo;
    for (let i = 0; i < len; i++) {
      info = this.m_ClockList.valueList[i];
      if (info) {
        --info.m_Count;
        if (info.m_Count <= 0) {
          this.clearClock(info.m_ID);
        }
      }
    }
    Globals.MessageCenter.emit(MessageType.GAME_GLOBALS_TICK, deltaTime);
  }

  public onFrame(): void {
    Globals.MessageCenter.emit(MessageType.GAME_GLOBALS_FRAME);
  }

  public dispose(): void {
    if (!this.initilized) {
      return;
    }
    if (this.mTick) {
      this.mTick.onDispose();
      this.mTick = null;
    }
    this.mInitilized = false;
    super.dispose();
  }
}
