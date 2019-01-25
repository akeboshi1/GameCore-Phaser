import BaseSingleton from "../../base/BaseSingleton";
import {HashMap} from "../../base/ds/HashMap";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";
import {ObjectPool} from "../../base/pool/base/ObjectPool";

export class ObjectPoolManager extends BaseSingleton {
  protected mObjectPoolHash: HashMap = new HashMap();
  public constructor() {
    super();
  }

  public getObjectPool(key: string, OPClass: any = ObjectPool, max: number = 0): IObjectPool {
    let op: IObjectPool = this.mObjectPoolHash.getValue(key);
    if (null == op) {
      op = new OPClass(max);
      this.mObjectPoolHash.add(key, op);
    }
    return op;
  }

  public dispose(): void {
    let len = this.mObjectPoolHash.valueList.length;
    let op: IObjectPool;
    for (let i = 0; i < len; i++) {
      op = this.mObjectPoolHash.valueList[i];
      op.onDispose();
    }
    this.mObjectPoolHash.clear();
    super.dispose();
  }
}
