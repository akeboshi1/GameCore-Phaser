import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { Logger } from "utils";

export class PicaMarqueeMediator extends BasicMediator {
  private mPriorityQueue: any[] = [];
  private mMapQueue: Map<number, any[]> = new Map();
  constructor(game: Game) {
    super(ModuleName.PICAMARQUEE_NAME, game);
  }

  show(param?: any) {
    super.show(param);
    this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
  }
  panelInit() {
    super.panelInit();
    this.playMarqueeData();
  }
  setParam(param) {
    super.setParam(param);
    this.setPriorityMsg(param);
  }
  hide() {
    this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
    super.hide();
  }

  private playMarqueeData() {
    if (this.mPriorityQueue.length > 0) {
      const param = this.getNextMsg();
      this.mView.setMarqueeData(param);
      return true;
    }
    return false;
  }
  private onCloseHandler() {
    if (!this.playMarqueeData()) this.hide();
  }

  private setPriorityMsg(msg: { message: string, priority: number }) {
    if (msg) {
      if (this.mMapQueue.has(msg.priority)) {
        const arr = this.mMapQueue.get(msg.priority);
        arr.push(msg);
      } else {
        const arr = [msg.message];
        this.mMapQueue.set(msg.priority, arr);
      }
    }
    if (this.mPriorityQueue.indexOf(msg.priority) === -1) {
      if (this.mPriorityQueue.length === 0) {
        this.mPriorityQueue.push(msg.priority);
      }
      this.mPriorityQueue.sort();
    }
  }

  private getNextMsg() {
    if (this.mPriorityQueue.length === 0) return undefined;
    const indexed = this.mPriorityQueue.length - 1;
    const priority = this.mPriorityQueue[indexed];
    if (this.mMapQueue.has(priority)) {
      const arr = this.mMapQueue.get(priority);
      const msg = arr.shift();
      if (arr.length === 0) this.mMapQueue.delete(priority);
      this.mPriorityQueue.splice(indexed, 1);
      return msg;
    }
    this.mPriorityQueue.splice(indexed, 1);
    return undefined;
  }
}
