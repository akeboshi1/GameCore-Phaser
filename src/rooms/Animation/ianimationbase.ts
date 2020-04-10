
export interface IAnimationBase {
    resName: string;
    resUrl: string;
    rate?: number;
    animUrlData: AnimationUrlData;
    loaded: boolean;
    loop: boolean;
    load(resName: string, resUrl: string, jsonUrl?: string);
    play(aniName: string);
}

export class AnimationUrlData {
    public resName: string;
    public resUrl: string;
    public pngUrl: string;
    public jsonUrl: string;
    public boneUrl: string;
    public responseType: string;
    textureXhrSettings?: any;
    atlasXhrSettings?: any;
    boneXhrSettings?: any;
    setData(resName: string, resUrl: string, isbone: boolean = false, extension: string = ".json") {
        this.resName = resName;
        this.resUrl = resUrl;
        this.pngUrl = resUrl + "/" + resName + (!isbone ? ".png" : "_tex.png");
        this.jsonUrl = resUrl + "/" + resName + (!isbone ? ".json" : "_tex.json");
        if (isbone)
            this.boneUrl = resUrl + "/" + resName + "_ske" + extension;
        this.responseType = extension === ".dbbin" ? "arraybuffer" : null;
        this.boneXhrSettings = this.responseType ? { responseType: "arraybuffer" } : null;
    }

    setDisplayData(pngUrl: string, jsonUrl: string, extension: string = ".json") {
        this.pngUrl = pngUrl;
        this.jsonUrl = jsonUrl;
        this.responseType = extension === ".dbbin" ? "arraybuffer" : null;
        this.boneXhrSettings = this.responseType ? { responseType: "arraybuffer" } : null;
    }
    public dispose() {
        this.textureXhrSettings = null;
        this.atlasXhrSettings = null;
        this.boneXhrSettings = null;
    }
}
