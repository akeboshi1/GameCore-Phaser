import { Lite, PaletteNode, TerrainCollectionNode, MossNode, AssetsNode, WallCollectionNode, MossCollectionNode } from "game-capsule";
import { IDragonbonesModel, IFramesModel, IScenery } from "structure";
import { DragonbonesModel, FramesModel } from "../sprite";
export interface IAsset {
    type: string;
    key: string;
    source: string;
}
export interface IElementStorage {
    setGameConfig(gameConfig: Lite): any;
    updatePalette(palette: PaletteNode): any;
    updateMoss(moss: MossNode): any;
    setSceneConfig(config: Lite): any;
    add(obj: IFramesModel | IDragonbonesModel): void;
    getDisplayModel(id: number): IFramesModel | IDragonbonesModel;
    getTerrainCollection(): any;
    getTerrainPalette(key: number): IFramesModel;
    getTerrainPaletteByBindId(id: number): IFramesModel;
    getMossPalette(key: number): {
        layer: number;
        frameModel: FramesModel;
    };
    getAssets(): IAsset[];
    getScenerys(): IScenery[];
    destroy(): any;
}
interface IDisplayRef {
    id: number;
    name?: string;
    displayModel?: FramesModel | DragonbonesModel;
}
export declare class ElementStorage implements IElementStorage {
    protected mModels: Map<number, FramesModel | DragonbonesModel>;
    protected mElementRef: Map<number, IDisplayRef>;
    protected terrainPalette: Map<number, FramesModel>;
    protected terrainPaletteWithBindId: Map<number, FramesModel>;
    protected mossPalette: Map<number, {
        layer: number;
        frameModel: FramesModel;
    }>;
    protected _terrainCollection: TerrainCollectionNode;
    protected _mossCollection: MossCollectionNode;
    protected _wallCollection: WallCollectionNode;
    protected _scenerys: IScenery[];
    protected _assets: IAsset[];
    constructor();
    setGameConfig(config: Lite): void;
    updatePalette(palette: PaletteNode): void;
    updateMoss(moss: MossNode): void;
    updateAssets(assetsNode: AssetsNode): void;
    setSceneConfig(config: any): void;
    add(obj: FramesModel | DragonbonesModel): void;
    getElementRef(id: any): IDisplayRef;
    getDisplayModel(id: number): FramesModel | DragonbonesModel;
    getTerrainCollection(): TerrainCollectionNode;
    getTerrainPalette(key: number): FramesModel;
    getTerrainPaletteByBindId(id: number): FramesModel;
    getMossCollection(): MossCollectionNode;
    getMossPalette(id: number): {
        layer: number;
        frameModel: FramesModel;
    };
    getScenerys(): IScenery[];
    getAssets(): IAsset[];
    getWallCollection(): WallCollectionNode;
    destroy(): void;
}
export {};
