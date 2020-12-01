import { Game } from "gamecore";
import { Handler } from "utils";

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

    private game: Game;
    private atlasMap: Map<string, AtlasUrlData> = new Map<string, AtlasUrlData>();
    public init(game: Game) {
        this.game = game;
    }

    public add(atlasName: string, loadType = UILoadType.none, folder?: string) {
        // if (loadType === UILoadType.atlas) {
        //     var atlasUrl = UrlUtil.getUIAtlasUrl(atlasName, folder);
        //     var atlasJsonUrl = UrlUtil.getUIAtlasJsonUrl(atlasName, folder);
        //     var data = new AtlasUrlData(atlasName, atlasUrl, atlasJsonUrl, loadType);

        // } else if (loadType === UILoadType.font) {
        //     var atlasUrl = UrlUtil.getFontUrl(atlasName, folder);
        //     var atlasJsonUrl = UrlUtil.getFontJsonUrl(atlasName, folder);
        //     var data = new AtlasUrlData(atlasName, atlasUrl, atlasJsonUrl, loadType);
        // } else if (loadType === UILoadType.texture) {
        //     var atlasUrl = UrlUtil.getTextureUrl(atlasName, folder);
        //     var data = new AtlasUrlData(atlasName, atlasUrl, null, loadType);
        // }
        // this.atlasMap.set(atlasName, data);
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
    private getUILoadType(tag: string) {
        if (tag === "Atlas") {
            return UILoadType.atlas;
        } else if (tag === "Texture") {
            return UILoadType.texture;
        }
    }
}
