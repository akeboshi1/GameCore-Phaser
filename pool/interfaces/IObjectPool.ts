import {IRecycleObject} from "../../base/object/interfaces/IRecycleObject";

export interface IObjectPool {
  /**
   * 借出对象
   */
  alloc(): IRecycleObject;

  /**
   * 回收对象
   */
  free(obj: IRecycleObject): void;
  /**
   * 清理对象
   */
  collect(value?: number): void;
}
