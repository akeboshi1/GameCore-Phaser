import { BaseConfigData } from "gamecore";
import { IScene } from "picaStructure";
export declare class SceneConfig extends BaseConfigData {
    sceneMap: Map<string, IScene[]>;
    get(id: string): IScene;
    parseJson(json: any): void;
}
export declare class SceneConfigMap {
    sceneMap: Map<string, IScene[]>;
    setSceneMap(map: Map<string, IScene[]>, i18nFun: (value: string) => string): void;
    getScenes(type?: string, tag?: number): Map<any, any> | IScene[];
    sort(): void;
    private combineMap;
}
