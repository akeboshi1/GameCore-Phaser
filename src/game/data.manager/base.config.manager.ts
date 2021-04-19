import { Game } from "gamecore";
import { load, loadArr } from "utils";
import { Logger } from "structure";
import { BaseConfigData } from "./base.config.data";
import { base_path, config_path } from "./config";
export class BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData> = new Map();
    protected mGame: Game;
    protected mInitialization: boolean = false;
    protected mDispose: boolean = false;
    constructor(game: Game) {
        this.mGame = game;
    }

    public getConfig<T extends BaseConfigData>(key: string) {
        return <T>(this.dataMap.get(key));
    }
    public startLoad(basePath: string): Promise<any> {
        if (this.mInitialization) {
            return new Promise((resolve, reject) => {
                if (this.mDispose) return;
                resolve(true);
            });
        } else {
            return this.getBasePath().then((value: string) => {
                if (this.mDispose) return;
                this.dirname(value);
                // 开始加载时先清空配置
                this.dataMap.clear();
                // 再添加对应的配置
                this.add();
                this.mGame.loadJson();
                return this.executeLoad(this.dataMap);
            });
        }
    }

    public dynamicLoad(dataMap: Map<string, BaseConfigData>): Promise<any> {
        if (this.mDispose) return;
        dataMap.forEach((value, key) => {
            this.dataMap.set(key, value);
        });
        return this.executeLoad(dataMap);
    }
    public executeLoad(dataMap: Map<string, BaseConfigData>): Promise<any> {
        return new Promise((resolve, reject) => {
            if (dataMap.size === 0) {
                if (this.mDispose) return;
                this.mInitialization = true;
                resolve(true);
                return;
            }
            this.checkLocalStorage(dataMap).then((values) => {
                if (this.mDispose) return;
                const loadUrls = [];
                for (const value of values) {
                    if (value.obj) {
                        const dataconfig = dataMap.get(value.key);
                        dataconfig.parseJson(value.obj);
                    } else {
                        const temp = { resName: value.key, path: value.url, type: value.responseType || "json" };
                        loadUrls.push(temp);
                    }
                }
                if (loadUrls.length > 0) {
                    loadArr(loadUrls).then((data) => {
                        if (this.mDispose) return;
                        data.forEach((value: XMLHttpRequest, key: string) => {
                            const obj = dataMap.get(key);
                            obj.resName = key;
                            const json = value.response;
                            obj.parseJson(json);
                        });
                        this.mInitialization = true;
                        resolve(true);
                    }, (reponse) => {
                        const errorTex = "未成功加载配置:" + reponse;
                        Logger.getInstance().error(errorTex);
                        // this.mGame.renderPeer.showAlertReconnect(i18n.t("commontips.configerror"));
                        if (this.mDispose) return;
                        reject(errorTex);
                    });
                } else {
                    if (this.mDispose) return;
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
    public destory() {
        this.mInitialization = false;
        this.dataMap.clear();
        this.mDispose = true;
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
            const obj = this.getLocalStorage(key, temppath, value.responseType);
            promises.push(obj);
        });
        return Promise.all(promises);
    }

    protected async getLocalStorage(key: string, jsonUrl: string, responseType: string) {
        const cachestring = await this.mGame.peer.render.getLocalStorage(key);
        if (cachestring !== null) {
            const temp = JSON.parse(cachestring);
            if (temp.url === jsonUrl) {
                return { key, url: jsonUrl, obj: temp.obj, responseType };
            } else {
                this.mGame.peer.render.removeLocalStorage(key);
            }
        }
        return { key, url: jsonUrl, obj: null, responseType };
    }

    protected setLocalStorage(key: string, jsonUrl: string, obj: object) {
        // const temp = { url: jsonUrl, obj };
        // this.mGame.peer.render.setLocalStorage(key, JSON.stringify(temp));
    }
    protected getBasePath() {
        return new Promise((resolve, reject) => {
            const url = config_path;
            load(url, "json").then((value: XMLHttpRequest) => {
                const json = value.response;
                const version = json.version;
                const baseUrl = base_path + version + "/";
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
