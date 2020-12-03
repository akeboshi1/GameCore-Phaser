import { Render } from "gamecoreRender";
import { Handler, Logger } from "utils";
import { UIAtlasName } from "./ui.atlas.name";

export enum UILoadType {
    none = 1,
    atlas = 2,
    font = 3,
    texture = 4,
}
export class AtlasUrlData {
    public atlasName: string;
    public atlasUrl: string;
    public jsonUrl: string;
    public uiType: UILoadType = UILoadType.none;
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
    }

    public add(atlasName: string, loadType = UILoadType.none, folder?: string) {
        let data: AtlasUrlData;
        if (loadType === UILoadType.atlas) {
            const url = `${atlasName}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.png`, `${url}.json`, UILoadType.atlas);
        } else if (loadType === UILoadType.font) {
            const url = `${atlasName}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.png`, `${url}.json`, UILoadType.font);
        } else if (loadType === UILoadType.texture) {
            const url = `${atlasName}/${atlasName}`;
            data = new AtlasUrlData(atlasName, `${url}.png`, undefined, UILoadType.texture);
        }
        this.atlasMap.set(atlasName, data);
    }
    public getAtalsArr(atalsNames: string[]) {
        const tempUrls: AtlasUrlData[] = [];
        for (const name of atalsNames) {
            try {
                const urlData = this.atlasMap.get(name);
                tempUrls.push(urlData);
            } catch (error) {
                Logger.getInstance().error("图集${name}不存在");
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
