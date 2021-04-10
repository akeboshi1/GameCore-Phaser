import { Render } from "gamecoreRender";
import { Handler, Logger } from "utils";
import { UIAtlasName } from "./ui.atlas.name";

export interface AtlasData {
    atlasName: string;
    folder: string;
    foldType?: FolderType;
    uiType?: UILoadType;
}

export enum FolderType {
    DPR = 1,
    NORMAL = 2,
    OSD = 3
}

export enum UILoadType {
    none = 1,
    atlas = 2,
    font = 3,
    texture = 4,
    video = 5,
    json = 6
}
export class AtlasUrlData {
    public atlasName: string;
    public atlasUrl: string;
    public jsonUrl: string;
    public uiType: UILoadType = UILoadType.none;
    public foldType: FolderType = FolderType.DPR;
    public constructor(atlasName: string, url: string, jsonUrl: string, uiType = UILoadType.none) {
        this.atlasName = atlasName;
        this.atlasUrl = url;
        this.jsonUrl = jsonUrl;
        this.uiType = uiType;
    }
}
export class AtlasManager {

    public render: Render;
    private atlasMap: Map<string, AtlasUrlData> = new Map<string, AtlasUrlData>();
    public init(render: Render) {
        this.render = render;
        this.add(UIAtlasName.uicommon, UILoadType.atlas);
        this.add(UIAtlasName.iconcommon, UILoadType.atlas);
        this.add(UIAtlasName.effectcommon, UILoadType.atlas);
    }

    public add(atlasName: string, loadType = UILoadType.none, folder?: string, foldType?: FolderType) {
        let data: AtlasUrlData;
        folder = folder || atlasName;
        foldType = foldType || FolderType.DPR;
        if (loadType === UILoadType.atlas) {
            const url = `${folder}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.png`, `${url}.json`, UILoadType.atlas);
        } else if (loadType === UILoadType.font) {
            const url = `${folder}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.ttf`, undefined, UILoadType.font);
        } else if (loadType === UILoadType.texture) {
            const url = `${folder}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.png`, undefined, UILoadType.texture);
        } else if (loadType === UILoadType.video) {
            const url = `${folder}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.mp4`, undefined, UILoadType.video);
        }
        data.foldType = foldType;
        this.atlasMap.set(atlasName, data);
        return data;
    }
    public getUrlDatas(atlas: Array<string | AtlasData>, loadType: UILoadType = UILoadType.atlas) {
        const tempUrls: AtlasUrlData[] = [];
        for (const obj of atlas) {
            let name, folder, foldType;
            if (typeof obj === "object") {
                name = obj.atlasName;
                folder = obj.folder;
                loadType = obj.uiType || loadType;
                foldType = obj.foldType;
            } else {
                name = obj;
            }
            if (this.atlasMap.has(name)) {
                const urlData = this.atlasMap.get(name);
                tempUrls.push(urlData);
            } else {
                const data = this.add(name, loadType, folder, foldType);
                tempUrls.push(data);
            }
        }
        return tempUrls;
    }

    public loadAtlas(urls: string[], arr: string[], comp: Handler, progress?: Handler) {

    }

    public isAtlasLoaded(atlasName: string) {
        return false;
    }

    public loadTexture(textureName: string, extend = ".png") {

    }

    public unloadAtlas(atlasName: string) {

    }

    public loadFont(fontName: string, compl: Handler) {

    }
}
