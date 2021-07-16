import { Lite, TerrainCollectionNode, MossNode, AssetsNode, WallCollectionNode, MossCollectionNode, Capsule, GroundWalkableCollectionNode } from "game-capsule";
import { op_def } from "pixelpai_proto";
import { IDragonbonesModel, IFramesModel, IPos, IResPath, IScenery, ITilesetProperty } from "structure";
import { DragonbonesModel, FramesModel } from "../sprite";
export interface IAsset {
    type: string;
    key: string;
    source: string;
}
export interface IElementStorage {
    setGameConfig(gameConfig: Lite): any;
    updateMoss(moss: MossNode): any;
    setSceneConfig(config: Lite): any;
    add(obj: IFramesModel | IDragonbonesModel): void;
    getDisplayModel(id: number): IFramesModel | IDragonbonesModel;
    getTerrainCollection(): any;
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
    mountSprites?: number[];
}
export declare class ElementStorage implements IElementStorage {
    private config;
    private mModels;
    private mElementRef;
    private mDisplayRefMap;
    private terrainPaletteWithSN;
    private tilesetsSN2Idx;
    private mossPalette;
    private _terrainCollection;
    private _mossCollection;
    private _wallCollection;
    private _groundWalkableCollection;
    private _scenerys;
    private _assets;
    constructor(config: IResPath);
    setGameConfig(config: Lite): void;
    updateMoss(moss: MossNode): void;
    updateAssets(assetsNode: AssetsNode): void;
    setSceneConfig(config: Capsule): void;
    add(obj: FramesModel | DragonbonesModel): void;
    getElementRef(id: any): IDisplayRef;
    getDisplayModel(id: number): FramesModel | DragonbonesModel;
    getTerrainCollection(): TerrainCollectionNode;
    getTerrainPaletteBySN(sn: string): FramesModel;
    getMossCollection(): MossCollectionNode;
    getMossPalette(id: number): {
        layer: number;
        frameModel: FramesModel;
    };
    getScenerys(): IScenery[];
    getAssets(): IAsset[];
    getWallCollection(): WallCollectionNode;
    getGroundWalkableCollection(): GroundWalkableCollectionNode;
    getTilesetIndexBySN(sn: string): number;
    getElementFromBlockIndex(indexs: number[], nodeType: op_def.NodeType): any[];
    updateTilesets(props: ITilesetProperty[]): void;
    destroy(): void;
    private addDisplayRef;
    private addMossToDisplayRef;
    private clearDisplayRef;
}
