import { Game } from "gamecore";
import { BaseConfigData } from "./base.config.data";
export declare class BaseConfigManager {
    protected baseDirname: string;
    protected dataMap: Map<string, BaseConfigData>;
    protected mGame: Game;
    protected mInitialization: boolean;
    protected mDispose: boolean;
    constructor(game: Game);
    getConfig<T extends BaseConfigData>(key: string): T;
    startLoad(basePath: string): Promise<any>;
    dynamicLoad(dataMap: Map<string, BaseConfigData>): Promise<any>;
    executeLoad(dataMap: Map<string, BaseConfigData>): Promise<any>;
    destory(): void;
    protected add(): void;
    protected dirname(path: string): void;
    protected configUrl(reName: string, tempurl?: string): string;
    protected checkLocalStorage(dataMap: Map<string, BaseConfigData>): Promise<any>;
    protected getLocalStorage(key: string, jsonUrl: string): Promise<{
        key: string;
        url: string;
        obj: any;
    }>;
    protected setLocalStorage(key: string, jsonUrl: string, obj: object): void;
    protected getBasePath(): Promise<unknown>;
    get initialize(): boolean;
}
