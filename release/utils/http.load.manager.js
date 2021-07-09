var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _HttpLoadManager = class {
  constructor() {
    __publicField(this, "mCacheList", []);
    __publicField(this, "mCurLen", 0);
  }
  update(time, delay) {
    if (this.mCacheList && this.mCurLen < _HttpLoadManager.maxLen) {
      const tmpLen = _HttpLoadManager.maxLen - this.mCurLen;
      const list = this.mCacheList.splice(0, tmpLen);
      for (let i = 0; i < tmpLen; i++) {
        const http = list[i];
        if (http) {
          this.mCurLen++;
          http.send();
        }
      }
    }
  }
  destroy() {
    this.mCacheList.length = 0;
    this.mCacheList = [];
    this.mCurLen = 0;
  }
  addLoader(loaderConfig) {
    if (this.mCurLen < _HttpLoadManager.maxLen) {
      const path = loaderConfig.path;
      const responseType = loaderConfig.responseType;
      return new Promise((resolve, reject) => {
        const http = new XMLHttpRequest();
        http.addEventListener("error", () => {
          console.log("http error =============>>>>");
        });
        http.timeout = 2e4;
        http.onload = (response) => {
          this.mCurLen--;
          const currentTarget = response.currentTarget;
          if (currentTarget && currentTarget["status"] === 200)
            resolve(response.currentTarget);
          else
            reject(`${path} load error ${currentTarget["status"]}`);
        };
        http.onerror = () => {
          this.mCurLen--;
          console.log("http error ====>");
          reject(`${path} load error!!!!!`);
        };
        http.ontimeout = (e) => {
          this.mCurLen--;
          console.log("http timeout ====>");
          reject(`${path} load ontimeout!!!!!`);
        };
        http.open("GET", path, true);
        http.responseType = responseType || "";
        this.mCurLen++;
        http.send();
      });
    } else {
      this.mCacheList.unshift(loaderConfig);
    }
  }
  startSingleLoader(loaderConfig) {
    const path = loaderConfig.path;
    const responseType = loaderConfig.responseType;
    return new Promise((resolve, reject) => {
      const http = new XMLHttpRequest();
      http.addEventListener("error", () => {
        console.log("http error =============>>>>");
      });
      http.timeout = 2e4;
      http.onload = (response) => {
        this.mCurLen--;
        const currentTarget = response.currentTarget;
        if (currentTarget && currentTarget["status"] === 200)
          resolve(response.currentTarget);
        else
          reject(`${path} load error ${currentTarget["status"]}`);
      };
      http.onerror = () => {
        this.mCurLen--;
        console.log("http error ====>");
        reject(`${path} load error!!!!!`);
      };
      http.ontimeout = (e) => {
        this.mCurLen--;
        console.log("http timeout ====>");
        reject(`${path} load ontimeout!!!!!`);
      };
      http.open("GET", path, true);
      http.responseType = responseType || "";
      if (this.mCurLen >= _HttpLoadManager.maxLen) {
        this.mCacheList.push(http);
      } else {
        this.mCurLen++;
        http.send();
      }
    });
  }
  startListLoader(loaderConfigs) {
    return new Promise((reslove, reject) => {
      const len = loaderConfigs.length;
      for (let i = 0; i < len; i++) {
        const loaderConfig = loaderConfigs[i];
        if (!loaderConfig)
          continue;
        this.startSingleLoader(loaderConfig).then((req) => {
          reslove(req);
        }).catch(() => {
          reslove(null);
        });
      }
    });
  }
};
export let HttpLoadManager = _HttpLoadManager;
__publicField(HttpLoadManager, "maxLen", 30);
