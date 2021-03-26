import { BaseConfigData } from "gamecore";
import { IGalleryCombination, IGalleryLevel } from "picaStructure";
import { Logger } from "utils";
export class GalleryConfig extends BaseConfigData {

    public combMap: Map<string | number, IGalleryCombination> = new Map();
    public dexMap: Map<string | number, IGalleryLevel> = new Map();
    public galleryMap: Map<string | number, IGalleryLevel> = new Map();
    public get(id: string | number, type: GalleryType) {
        const map = this.getMap(type);
        if (map.has(id)) {
            return map.get(id);
        } else {
            Logger.getInstance().error(`gallery表${type}未配置ID为:${id}的数据`);
            return undefined;
        }
    }

    public getMap(type: string) {
        if (type === GalleryType.combination) {
            return this.combMap;
        } else if (type === GalleryType.dexLevel) {
            return this.dexMap;
        } else {
            return this.galleryMap;
        }
    }
    public parseJson(json) {
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const tempArr = json[key];
                const map = this.getMap(key);
                for (const temp of tempArr) {
                    map.set(temp.id, temp);
                }
            }
        }
    }
}

export enum GalleryType {
    combination = "combination",
    dexLevel = "dexLevel",
    galleryLevel = "galleryLevel"
}
