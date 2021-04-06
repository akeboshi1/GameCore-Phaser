import { BaseConfigData } from "gamecore";
import { IScene } from "picaStructure";
import { Logger } from "utils";
export class SceneConfig extends BaseConfigData {
    public sceneMap: Map<string, IScene[]> = new Map();
    public get(id: string): IScene {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`Scene表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        for (const key in json) {
            const temp = json[key];
            this[key] = temp;
            const subcategory = temp.subcategory || "undefined";
            if (this.sceneMap.has(subcategory)) {
                const arr = this.sceneMap.get(subcategory);
                arr.push(temp);
            } else {
                const arr = [];
                arr.push(temp);
                this.sceneMap.set(subcategory, arr);
            }
        }

    }
}
export class SceneConfigMap {
    sceneMap: Map<string, IScene[]> = new Map();
    public setSceneMap(map: Map<string, IScene[]>, i18nFun: (value: string) => string) {
        this.combineMap(map, i18nFun);
    }
    public getScenes(type?: string, tag?: number) {
        if (tag !== undefined) {
            if (type) {
                const tempArr = this.sceneMap.get(type);
                const gvalue: IScene[] = [];
                for (const value of tempArr) {
                    if (value.tag === tag) gvalue.push(value);
                }
                return gvalue;
            } else {
                const map = new Map();
                this.sceneMap.forEach((tempValue, key) => {
                    const gvalue: IScene[] = [];
                    for (const vv of tempValue) {
                        if (vv.tag === tag) {
                            gvalue.push(vv);
                        }
                    }
                    map.set(key, gvalue);
                });
            }
        } else if (type !== undefined) {
            return this.sceneMap.get(type);
        } else return this.sceneMap;
    }
    public sort() {
        const map = this.sceneMap;
        this.sceneMap = new Map();
        const keys: any[] = Array.from(map.keys());
        keys.sort((a, b) => {
            let av = Number(a[a.length - 1]);
            av = isNaN(av) ? Number.MAX_VALUE : av;
            let bv = Number(b[b.length - 1]);
            bv = isNaN(bv) ? Number.MAX_VALUE : bv;
            if (av > bv) return 1;
            else return -1;
        });
        for (const ttkey of keys) {
            this.sceneMap.set(ttkey, map.get(ttkey));
        }
        map.clear();
    }
    private combineMap(fromMap: Map<string, IScene[]>, i18nFun: (value: string) => string) {
        const map = this.sceneMap;
        fromMap.forEach((value, key) => {
            if (map.has(key)) {
                const datas = map.get(key);
                for (const temp of value) {
                    temp.roomName = i18nFun(temp.roomName);
                    datas.push(temp);
                }
            } else {
                const datas = [];
                for (const temp of value) {
                    temp.roomName = i18nFun(temp.roomName);
                    datas.push(temp);
                }
                map.set(key, datas);
            }
        });
    }
}
