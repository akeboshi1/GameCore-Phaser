/**
 * 全局触发器
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import {Tick} from "../tick/Tick";

export class TickManager extends BaseSingleton {

    private game: Phaser.Game;
    private m_TickList: Tick[];
    private m_LastTime = 0;
    private mInitilized = false;

    public constructor() {
        super();
    }

  public get initilized(): boolean {
    return this.mInitilized;
  }

    public init(game: Phaser.Game): void {
        this.game = game;
        this.m_LastTime = this.game.time.now;
        this.m_TickList = [];
        this.mInitilized = true;
    }

    /**
     *
     * 增加计时触发器
     * @param interval 时间间隔:毫秒
     * @param method 执行函数
     * @param thisObj 执行函数对应的this对象
     * @param triggerImmediately 是否立刻执行一次
     */
    public addTick(tick: Tick): void {
        if (null === this.m_TickList) return;
        if (this.m_TickList.indexOf(tick) === -1)
            this.m_TickList.push(tick);
    }

    public onTick(): void {
        if (this.game === undefined || this.game == null || this.m_TickList === undefined || this.m_TickList.length === 0) return;
        let len: number = this.m_TickList.length;
        let tick: Tick;
        let now = this.game.time.now;
        let timeElapsed = now - this.m_LastTime;
        this.m_LastTime = now;
        for (let i = len - 1; i >= 0; i--) {
          tick = this.m_TickList[i];
          if (!tick.isEnd()) {
            tick.onTick(timeElapsed);
          } else {
            this.m_TickList.splice(i, 1);
          }
        }
    }

    public onRender(): void {
        if (this.game === undefined || this.game == null || this.m_TickList === undefined || this.m_TickList.length === 0) return;
        let len: number = this.m_TickList.length;
        let tick: Tick;
        for (let i = len - 1; i >= 0; i--) {
            tick = this.m_TickList[i];
            if (!tick.isEnd()) {
                tick.onRender();
            } else {
                this.m_TickList.splice(i, 1);
            }
        }
    }

    public dispose(): void {
      if (!this.initilized) {
        return;
      }
      let len: number = this.m_TickList.length;
      let tick: Tick;
      for (let i = len - 1; i >= 0; i--) {
        tick = this.m_TickList[i];
        tick.onDispose();
      }
      this.m_TickList.length = 0;
      this.game = null;
      this.mInitilized = false;
      super.dispose();
    }
}


