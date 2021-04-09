import { IHttpLoaderConfig, load } from "./http";
import { Logger } from "./log";

export class HttpLoadManager {
    private static maxLen: number = 30; // 默认最大长度30个，浏览器最大并发数为32个，空余2个为了能处理优先加载逻辑
    private mCacheList: any[] = [];
    private mCurLen: number = 0;
    constructor() {
    }

    public update(time: number, delay: number) {
        if (this.mCacheList && this.mCurLen < HttpLoadManager.maxLen) {
            const tmpLen = HttpLoadManager.maxLen - this.mCurLen;
            const list = this.mCacheList.splice(0, tmpLen);
            for (let i: number = 0; i < tmpLen; i++) {
                const http = list[i];
                if (http) {
                    this.mCurLen++;
                    http.send();
                }
            }
        }
    }

    public destroy() {
        this.mCacheList.length = 0;
        this.mCacheList = [];
        this.mCurLen = 0;
    }

    public addLoader(loaderConfig: IHttpLoaderConfig) {
        if (this.mCurLen < HttpLoadManager.maxLen) {
            const path = loaderConfig.path;
            const responseType = loaderConfig.responseType;
            return new Promise((resolve, reject) => {
                const http = new XMLHttpRequest();
                http.addEventListener("error", () => {
                    Logger.getInstance().log("http error =============>>>>");
                });
                http.timeout = 20000; // 超时时间，单位是毫秒
                http.onload = (response: ProgressEvent) => {
                    this.mCurLen--;
                    const currentTarget = response.currentTarget;
                    if (currentTarget && currentTarget["status"] === 200)
                        resolve(response.currentTarget);
                    else reject(`${path} load error ${currentTarget["status"]}`);
                };
                http.onerror = () => {
                    this.mCurLen--;
                    Logger.getInstance().log("http error ====>");
                    reject(`${path} load error!!!!!`);
                };
                http.ontimeout = (e) => {
                    this.mCurLen--;
                    // XMLHttpRequest 超时。在此做某事。
                    Logger.getInstance().log("http timeout ====>");
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

    public startSingleLoader(loaderConfig: IHttpLoaderConfig): Promise<any> {
        const path = loaderConfig.path;
        const responseType = loaderConfig.responseType;
        return new Promise((resolve, reject) => {
            const http = new XMLHttpRequest();
            http.addEventListener("error", () => {
                Logger.getInstance().log("http error =============>>>>");
            });
            http.timeout = 20000; // 超时时间，单位是毫秒
            http.onload = (response: ProgressEvent) => {
                this.mCurLen--;
                const currentTarget = response.currentTarget;
                if (currentTarget && currentTarget["status"] === 200)
                    resolve(response.currentTarget);
                else reject(`${path} load error ${currentTarget["status"]}`);
            };
            http.onerror = () => {
                this.mCurLen--;
                Logger.getInstance().log("http error ====>");
                reject(`${path} load error!!!!!`);
            };
            http.ontimeout = (e) => {
                this.mCurLen--;
                // XMLHttpRequest 超时。在此做某事。
                Logger.getInstance().log("http timeout ====>");
                reject(`${path} load ontimeout!!!!!`);
            };
            http.open("GET", path, true);
            http.responseType = responseType || "";
            // 当前索引大于加载最大并发数量，则放入缓存队列中
            if (this.mCurLen >= HttpLoadManager.maxLen) {
                this.mCacheList.push(http);
            } else {
                this.mCurLen++;
                http.send();
            }
        });
    }

    public startListLoader(loaderConfigs: IHttpLoaderConfig[]): Promise<any> {
        return new Promise((reslove, reject) => {
            const len = loaderConfigs.length;
            for (let i: number = 0; i < len; i++) {
                const loaderConfig = loaderConfigs[i];
                if (!loaderConfig) continue;
                this.startSingleLoader(loaderConfig).then((req: any) => {
                    reslove(req);
                }).catch(() => {
                    reslove(null);
                });
            }
        });
    }
}
