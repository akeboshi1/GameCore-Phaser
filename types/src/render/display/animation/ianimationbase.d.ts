export interface IAnimationBase {
    resName: string;
    textureUrl: string;
    rate?: number;
    animUrlData: AnimationUrlData;
    loaded: boolean;
    loop: boolean;
    load(resName: string, resUrl: string, data?: string): any;
    play(aniName: string): any;
    destroy(): any;
    onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number): any;
}
export declare class AnimationUrlData {
    resName: string;
    resUrl: string;
    pngUrl: string;
    jsonUrl: string;
    boneUrl: string;
    responseType: string;
    textureXhrSettings?: any;
    atlasXhrSettings?: any;
    boneXhrSettings?: any;
    setData(resName: string, textureUrl: string, jsonUrl: string, boneUrl?: string, extension?: string): void;
    setDisplayData(pngUrl: string, jsonUrl: string, extension?: string): void;
    dispose(): void;
}
