import {IRecycleObject} from "../interfaces/IRecycleObject";
import {IObjectPool} from "../../pool/interfaces/IObjectPool";

export class RecycleObject implements IRecycleObject {
  private m_ObjectPool: IObjectPool;

  constructor(pool?: IObjectPool) {
    this.m_ObjectPool = pool;
  }

  public onRecycle(): void {
      if (this.m_ObjectPool) {
        this.m_ObjectPool.free(this);
      }
  }

  public onClear(): void {}
  public onDispose(): void {}
}
