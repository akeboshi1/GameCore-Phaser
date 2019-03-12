import BaseSingleton from "../../base/BaseSingleton";
import {HashMap} from "../../base/ds/HashMap";

export class ShareObjectCacheManager extends BaseSingleton {
  private _cachedShareObjects: HashMap = new HashMap();
  public constructor() {
    super();
  }

  public registerShareObject(key: string, shareObject: any) {
    if (!this._cachedShareObjects.has(key)) {
      this._cachedShareObjects.add(key, shareObject);
    }
  }

  public hasRegistShareObject(key: string): boolean {
    return this._cachedShareObjects.has(key);
  }

  public fetchShareObject(key: string): any {
    let shareObject = this._cachedShareObjects.getValue(key);
    if (shareObject) {
      return shareObject;
    }
    return null;
  }
}
