import {IRecycleObject} from "../../object/interfaces/IRecycleObject";
import {IDisposeObject} from "../../object/interfaces/IDisposeObject";

export interface IObjectPool extends IDisposeObject {
  /**
   * 借出对象
   */
  alloc(): any;

  /**
   * 回收对象
   */
  free(obj: any): void;
  /**
   * 清理对象
   */
  collect(value?: number): void;
}
