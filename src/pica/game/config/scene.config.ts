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
