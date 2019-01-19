import {IRecycleObject} from "../../object/interfaces/IRecycleObject";
import {IObjectPool} from "../interfaces/IObjectPool";

export class ObjectPool implements IObjectPool {
  protected m_ObjectList: any[];
  protected totalFree = 0;
  protected max = 0;

  constructor(value: number) {
    this.max = value;
    this.m_ObjectList = [];
  }

  public alloc(): IRecycleObject {
    let obj: IRecycleObject = null;
    if (this.totalFree === 0) {
      return null;
    }
    this.totalFree--;
    return this.m_ObjectList.pop();
  }

  public free(obj: IRecycleObject): void {
    // 判断是否是对象池里的对象
    if (null == obj) return;
    obj.onClear();
    this.m_ObjectList.push(obj);
    this.totalFree++;
    if (this.totalFree > this.max) {
      this.collect(this.totalFree - this.max);
    }
  }

  public collect(value?: number): void {
    let len = value || this.totalFree;
    for (let i = 0; i < len; i++) {
      let obj: IRecycleObject = this.m_ObjectList.pop();
      obj.onDispose();
      this.totalFree--;
    }
  }

  public onClear(): void {
  }

  public onDispose(): void {
    this.collect();
  }
}
