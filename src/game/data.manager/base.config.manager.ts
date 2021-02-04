import { Game } from "gamecore";
import { load, loadArr, Logger } from "utils";
import { BaseConfigData } from "./base.config.data";
export class BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    protected mGame: Game;
    constructor(game: Game) {
        this.mGame = game;
    }

    public getConfig<T extends BaseConfigData>(key: string) {
        return <T>(this.dataMap.get(key));
    }
    public startLoad(basePath: string): Promise<any> {
        return this.getBasePath().then((value: string) => {
            return this.executeLoad(value);
        });
    }
    public executeLoad(basePath: string): Promise<any> {
        this.dataMap.clear();
        return new Promise((resolve, reject) => {
            this.dirname(basePath);
            this.add();
            if (this.dataMap.size === 0) {
                resolve(true);
                return;
            }

            this.checkLocalStorage().then((values) => {
                const loadUrls = [];
                for (const value of values) {
                    if (value.obj) {
                        const dataconfig = this.dataMap.get(value.key);
                        dataconfig.parseJson(value.obj);
                    } else {
                        const temp = { resName: value.key, path: value.url, type: "json" };
                        loadUrls.push(temp);
                    }
                }
                if (loadUrls.length > 0) {
                    loadArr(loadUrls).then((data) => {
                        data.forEach((value: XMLHttpRequest, key: string) => {
                            const obj = this.dataMap.get(key);
                            const json = value.response;
                            try {
                                this.setLocalStorage(key, value.responseURL, json);
                            } catch (error) {
                                // tslint:disable-next-line:no-console
                                console.log("Local Storage is full, Please empty data");
                            }
                            obj.parseJson(json);
                        });
                        resolve(true);
                    }, (reponse) => {
                        Logger.getInstance().error("未成功加载配置:" + reponse);
                        resolve(true);
                    });
                } else {
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
    protected configUrl(reName: string) {
        const url = this.baseDirname + `${reName}.json`;
        return url;
    }

    protected checkLocalStorage(): Promise<any> {
        const promises = [];
        this.dataMap.forEach(async (value, key: string) => {
            const temppath = this.configUrl(key);
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
        this.mGame.peer.render.setLocalStorage(key, JSON.stringify(temp));
    }
    protected getBasePath() {
        return new Promise((resolve, reject) => {
            const url = "https://cdn.tooqing.com/game/resource/alpha/5e719a0a68196e416ecf7aad/.config.json";
            const cdnurl = "http://cdn.tooqing.com/game/resource/alpha/5e719a0a68196e416ecf7aad/";
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
}
