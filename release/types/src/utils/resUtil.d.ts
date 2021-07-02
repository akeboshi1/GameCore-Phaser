export declare const HTTP_REGEX: RegExp;
export declare class Url {
    OSD_PATH: string;
    RES_PATH: string;
    RESUI_PATH: string;
    RESOURCE_ROOT: string;
    init(config: any): void;
    getRes(value: string): string;
    getUIRes(dpr: number, value: string): string;
    getSound(key: string): string;
    getNormalUIRes(value: string): string;
    getOsdRes(value: string): string;
    getPartName(value: string): string;
    getPartUrl(value: string): string;
    getUsrAvatarTextureUrls(value: string): {
        img: string;
        json: string;
    };
    getGameConfig(value: string): string;
    getResRoot(value: string): string;
}
