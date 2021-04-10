import { UiManager, BasePanel } from "gamecoreRender";
import { AtlasData, FolderType } from "../../res";
export declare class PicaBasePanel extends BasePanel {
    protected uiManager: UiManager;
    protected atlasNames: Array<string | AtlasData>;
    protected textures: Array<string | AtlasData>;
    protected maskLoadingEnable: boolean;
    protected tempDatas: any;
    constructor(uiManager: UiManager);
    protected initResource(): void;
    protected preload(): void;
    protected init(): void;
    protected setLinear(key: string): void;
    protected setResourcesData(type: string, key: string, texture: string, data: string, foldType: FolderType): void;
    protected addResources(key: string, resource: any): void;
}
