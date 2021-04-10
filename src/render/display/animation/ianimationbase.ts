
export interface IAnimationBase {
    resName: string;
    textureUrl: string;
    rate?: number;
    animUrlData: AnimationUrlData;
    loaded: boolean;
    loop: boolean;
    load(resName: string, resUrl: string, data?: string);
    play(aniName: string);
    destroy();
    onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number);
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
    setData(resName: string,textureUrl: string,  jsonUrl: string, boneUrl?: string, extension: string = ".json") {
        this.resName = resName;
        this.pngUrl = textureUrl;
        this.jsonUrl = jsonUrl;
        this.boneUrl = boneUrl;
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
