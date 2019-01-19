import {IRecycleObject} from "../../object/interfaces/IRecycleObject";
import {IDisposeObject} from "../../object/interfaces/IDisposeObject";

export interface IObjectPool extends IDisposeObject {
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
