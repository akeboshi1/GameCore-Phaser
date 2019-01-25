import {IRecycleObject} from "../../object/interfaces/IRecycleObject";
import {IObjectPool} from "../interfaces/IObjectPool";
import {IAnimatedObject} from "../../IAnimatedObject";

export class ObjectPool implements IObjectPool {
  protected m_ObjectList: any[];
  protected totalFree = 0;
  protected max = 0;

  constructor(value: number) {
    this.max = value;
    this.m_ObjectList = [];
  }

  public alloc(): any {
    if (this.totalFree === 0) {
      return null;
    }
    this.totalFree--;
    return this.m_ObjectList.pop();
  }

  public free(obj: any): void {
    // 判断是否是对象池里的对象
    if (null == obj) return;
    if ((obj as IRecycleObject).onClear !== undefined) (<IRecycleObject>obj).onClear();
    this.m_ObjectList.push(obj);
    this.totalFree++;
    if (this.totalFree > this.max && this.max > 0) {
      this.collect(this.totalFree - this.max);
    }
  }

  public collect(value?: number): void {
    let len = value || this.totalFree;
    for (let i = 0; i < len; i++) {
      let obj: Object = this.m_ObjectList.pop();
      if ((obj as IRecycleObject).onDispose !== undefined) (<IRecycleObject>obj).onDispose();
      this.totalFree--;
    }
  }

  public onClear(): void {
  }

  public onDispose(): void {
    this.collect();
  }
}
