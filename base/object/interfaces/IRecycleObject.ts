import {IDisposeObject} from "./IDisposeObject";

export interface IRecycleObject extends IDisposeObject {
  /**
   *	对象回收
   */
  onRecycle(): void;
}
