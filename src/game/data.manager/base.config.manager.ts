import { Game } from "gamecore";
import { load, loadArr, Logger, Url } from "utils";
import { BaseConfigData } from "./base.config.data";
export class BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    protected mGame: Game;
    protected mInitialization: boolean = false;
    constructor(game: Game) {
        this.mGame = game;
    }

    public getConfig<T extends BaseConfigData>(key: string) {
        return <T>(this.dataMap.get(key));
    }
    public startLoad(basePath: string): Promise<any> {
        return this.getBasePath().then((value: string) => {
            this.dataMap.clear();
            this.dirname(value);
            this.add();
            return this.executeLoad(this.dataMap);
        });
    }

    public dynamicLoad(dataMap: Map<string, BaseConfigData>): Promise<any> {
        dataMap.forEach((value, key) => {
            this.dataMap.set(key, value);
        });
        return this.executeLoad(dataMap);
    }
    public executeLoad(dataMap: Map<string, BaseConfigData>): Promise<any> {
        return new Promise((resolve, reject) => {
            if (dataMap.size === 0) {
                this.mInitialization = true;
                resolve(true);
                return;
            }
            this.checkLocalStorage(dataMap).then((values) => {
                const loadUrls = [];
                for (const value of values) {
                    if (value.obj) {
                        const dataconfig = dataMap.get(value.key);
                        dataconfig.parseJson(value.obj);
                    } else {
                        const temp = { resName: value.key, path: value.url, type: "json" };
                        loadUrls.push(temp);
                    }
                }
                if (loadUrls.length > 0) {
                    loadArr(loadUrls).then((data) => {
                        data.forEach((value: XMLHttpRequest, key: string) => {
                            const obj = dataMap.get(key);
                            obj.resName = key;
                            const json = value.response;
                            try {
                                this.setLocalStorage(key, value.responseURL, json);
                            } catch (error) {
                                // tslint:disable-next-line:no-console
                                console.log("Local Storage is full, Please empty data");
                            }
                            obj.parseJson(json);
                        });
                        this.mInitialization = true;
                        resolve(true);
                    }, (reponse) => {
                        Logger.getInstance().error("未成功加载配置:" + reponse);
                        this.mInitialization = true;
                        resolve(true);
                    });
                } else {
                    this.mInitialization = true;
                    resolve(true);
                }
            });

            // const loadUrls = [];
            // this.dataMap.forEach(async (value, key: string) => {
            //     const temppath = this.configUrl(key);
            //     const temp = { resName: key, path: temppath, type: "json" };
            //     loadUrls.push(temp);
            // });
            // if (loadUrls.length > 0) {
            //     loadArr(loadUrls).then((data) => {
            //         data.forEach((value: XMLHttpRequest, key: string) => {
            //             const obj = this.dataMap.get(key);
            //             const json = value.response;
            //             obj.parseJson(json);
            //             this.setLocalStorage(key, value.responseURL, json);
            //         });
            //         resolve(true);
            //     }, (reponse) => {
            //         Logger.getInstance().error("未成功加载配置:" + reponse);
            //         resolve(true);
            //     });
            // } else {
            //     resolve(true);
            // }

        });
    }
    protected add() {
    }

    protected dirname(path: string) {
        // const index = path.lastIndexOf("/");
        // this.baseDirname = path.slice(0, index + 1);
        this.baseDirname = path;
    }
    protected configUrl(reName: string, tempurl?: string) {
        if (tempurl) {
            return tempurl;
        }
        const url = this.baseDirname + `${reName}.json`;
        return url;
    }

    protected checkLocalStorage(dataMap: Map<string, BaseConfigData>): Promise<any> {
        const promises = [];
        dataMap.forEach(async (value, key: string) => {
            const temppath = this.configUrl(key, value.url);
            const obj = this.getLocalStorage(key, temppath);
            promises.push(obj);
        });
        return Promise.all(promises);
    }

    protected async getLocalStorage(key: string, jsonUrl: string) {
        const cachestring = await this.mGame.peer.render.getLocalStorage(key);
        if (cachestring !== null) {
            const temp = JSON.parse(cachestring);
            if (temp.url === jsonUrl) {
                return { key, url: jsonUrl, obj: temp.obj };
            } else {
                this.mGame.peer.render.removeLocalStorage(key);
            }
        }
        return { key, url: jsonUrl, obj: null };
    }

    protected setLocalStorage(key: string, jsonUrl: string, obj: object) {
        const temp = { url: jsonUrl, obj };
        // this.mGame.peer.render.setLocalStorage(key, JSON.stringify(temp));
    }
    protected getBasePath() {
        return new Promise((resolve, reject) => {
            const url = "https://cdn.tooqing.com/game/resource/alpha/5e719a0a68196e416ecf7aad/.config.json";
            const cdnurl = "https://cdn.tooqing.com/game/resource/alpha/5e719a0a68196e416ecf7aad/";
            load(url, "json").then((value: XMLHttpRequest) => {
                const json = value.response;
                const version = json.version;
                const baseUrl = cdnurl + version + "/";
                resolve(baseUrl);
            }, (reponse) => {
                Logger.getInstance().error("版本配置加载失败URL: ", url);
            });
        });
    }
    get initialize() {
        return this.mInitialization;
    }
}
