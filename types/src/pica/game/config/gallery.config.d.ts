import { BaseConfigData } from "gamecore";
import { IGalleryCombination, IGalleryLevel } from "../../structure";
export declare class GalleryConfig extends BaseConfigData {
    combMap: Map<string | number, IGalleryCombination>;
    dexMap: Map<string | number, IGalleryLevel>;
    galleryMap: Map<string | number, IGalleryLevel>;
    get(id: string | number, type: GalleryType): IGalleryCombination | IGalleryLevel;
    getMap(type: string): Map<string | number, IGalleryCombination> | Map<string | number, IGalleryLevel>;
    parseJson(json: any): void;
}
export declare enum GalleryType {
    combination = "combination",
    dexLevel = "dexLevel",
    galleryLevel = "galleryLevel"
}
