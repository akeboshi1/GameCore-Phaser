import { IHttpLoaderConfig } from "./http";
export declare class HttpLoadManager {
    private static maxLen;
    private mCacheList;
    private mCurLen;
    constructor();
    update(time: number, delay: number): void;
    destroy(): void;
    addLoader(loaderConfig: IHttpLoaderConfig): Promise<unknown>;
    startSingleLoader(loaderConfig: IHttpLoaderConfig): Promise<any>;
    startListLoader(loaderConfigs: IHttpLoaderConfig[]): Promise<any>;
}
