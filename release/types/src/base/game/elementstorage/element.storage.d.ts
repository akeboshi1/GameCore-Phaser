import { Lite, PaletteNode, TerrainCollectionNode, MossNode, AssetsNode, WallCollectionNode, MossCollectionNode, Capsule } from "game-capsule";
import { op_def } from "pixelpai_proto";
import { IDragonbonesModel, IFramesModel, IPos, IScenery } from "structure";
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
    getTerrainPaletteBySN(sn: string): IFramesModel;
    getMossPalette(key: number): {
        layer: number;
        frameModel: FramesModel;
    };
    getAssets(): IAsset[];
    getScenerys(): IScenery[];
    destroy(): any;
}
export interface IDisplayRef {
    id: number;
    name?: string;
    pos?: IPos;
    direction?: number;
    blockIndex?: number;
    layer?: number;
    displayModel?: FramesModel | DragonbonesModel;
}
export declare class ElementStorage implements IElementStorage {
    protected mModels: Map<number, FramesModel | DragonbonesModel>;
    protected mElementRef: Map<number, IDisplayRef>;
    protected mTerrainRef: Map<number, IDisplayRef>;
    protected mDisplayRefMap: Map<op_def.NodeType, Map<number, IDisplayRef>>;
    protected terrainPalette: Map<number, FramesModel>;
    protected terrainPaletteWithBindId: Map<number, FramesModel>;
    protected terrainPaletteWithSN: Map<string, FramesModel>;
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
    setSceneConfig(config: Capsule): void;
    add(obj: FramesModel | DragonbonesModel): void;
    getElementRef(id: any): IDisplayRef;
    getDisplayModel(id: number): FramesModel | DragonbonesModel;
    getTerrainCollection(): TerrainCollectionNode;
    getTerrainPalette(key: number): FramesModel;
    getTerrainPaletteByBindId(id: number): FramesModel;
    getTerrainPaletteBySN(sn: string): FramesModel;
    getMossCollection(): MossCollectionNode;
    getMossPalette(id: number): {
        layer: number;
        frameModel: FramesModel;
    };
    getScenerys(): IScenery[];
    getAssets(): IAsset[];
    getWallCollection(): WallCollectionNode;
    getElementFromBlockIndex(indexs: number[], nodeType: op_def.NodeType): any[];
    destroy(): void;
    private addDisplayRef;
    private addTerrainToDisplayRef;
    private addMossToDisplayRef;
    private clearDisplayRef;
}
