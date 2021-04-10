import { Render } from "gamecoreRender";
import { Handler } from "utils";
export interface AtlasData {
    atlasName: string;
    folder: string;
    foldType?: FolderType;
    uiType?: UILoadType;
}
export declare enum FolderType {
    DPR = 1,
    NORMAL = 2,
    OSD = 3
}
export declare enum UILoadType {
    none = 1,
    atlas = 2,
    font = 3,
    texture = 4,
    video = 5,
    json = 6
}
export declare class AtlasUrlData {
    atlasName: string;
    atlasUrl: string;
    jsonUrl: string;
    uiType: UILoadType;
    foldType: FolderType;
    constructor(atlasName: string, url: string, jsonUrl: string, uiType?: UILoadType);
}
export declare class AtlasManager {
    render: Render;
    private atlasMap;
    init(render: Render): void;
    add(atlasName: string, loadType?: UILoadType, folder?: string, foldType?: FolderType): AtlasUrlData;
    getUrlDatas(atlas: Array<string | AtlasData>, loadType?: UILoadType): AtlasUrlData[];
    loadAtlas(urls: string[], arr: string[], comp: Handler, progress?: Handler): void;
    isAtlasLoaded(atlasName: string): boolean;
    loadTexture(textureName: string, extend?: string): void;
    unloadAtlas(atlasName: string): void;
    loadFont(fontName: string, compl: Handler): void;
}
