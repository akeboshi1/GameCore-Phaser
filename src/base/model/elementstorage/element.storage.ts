import {
    Lite,
    ElementNode,
    TerrainNode,
    PaletteNode,
    TerrainCollectionNode,
    SceneNode,
    AnimationDataNode,
    MossNode,
    AssetsNode,
    WallCollectionNode,
    EventNode,
} from "game-capsule";
import { op_def } from "pixelpai_proto";
import { MossCollectionNode } from "game-capsule";
import { Logger, ResUtils, Url } from "utils";
import { AnimationModel, IDragonbonesModel, IFramesModel, IScenery } from "structure";
import { FramesModel } from "../frames.model";
import { DragonbonesModel } from "../dragonbones.model";
export interface IAsset {
    type: string;
    key: string;
    source: string;
}

export interface IElementStorage {
    setGameConfig(gameConfig: Lite);
    updatePalette(palette: PaletteNode);
    updateMoss(moss: MossNode);
    setSceneConfig(config: Lite);
    add(obj: IFramesModel | IDragonbonesModel): void;
    getDisplayModel(id: number): IFramesModel | IDragonbonesModel;
    getTerrainCollection();
    getTerrainPalette(key: number): IFramesModel;
    getTerrainPaletteByBindId(id: number): IFramesModel;
    getMossPalette(key: number): { layer: number, frameModel: FramesModel };
    getAssets(): IAsset[];
    getScenerys(): IScenery[];
    // on(event: string | symbol, fn: Function, context?: any);
    // off(event: string | symbol, fn: Function, context?: any);
    destroy();
}

interface IDisplayRef {
    // element id
    id: number;
    name?: string;
    displayModel?: FramesModel | DragonbonesModel;
}

export class ElementStorage implements IElementStorage {
    private mModels = new Map<number, FramesModel | DragonbonesModel>();
    private mElementRef = new Map<number, IDisplayRef>();
    private terrainPalette = new Map<number, FramesModel>();
    private terrainPaletteWithBindId = new Map<number, FramesModel>();
    private mossPalette = new Map<number, { layer: number, frameModel: FramesModel }>();
    private _terrainCollection: TerrainCollectionNode;
    private _mossCollection: MossCollectionNode;
    private _wallCollection: WallCollectionNode;
    private _scenerys: IScenery[];
    private _assets: IAsset[];

    // private event: Phaser.Events.EventEmitter;

    constructor() {
        // this.event = new Phaser.Events.EventEmitter();
    }

    // public on(event: string | symbol, fn: Function, context?: any) {
    //     this.event.on(event, fn, context);
    // }

    // public off(event: string | symbol, fn: Function, context?: any) {
    //     this.event.off(event, fn, context);
    // }

    public setGameConfig(config: Lite) {
        Logger.getInstance().debug("TCL: ElementStorage -> config", config);
        if (!config) {
            return;
        }

        const objs = config.objectsList;
        let displayModel = null;
        for (const obj of objs) {
            if (obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.id);
                if (!displayModel) {
                    const anis = [];
                    const eleAnis = (<ElementNode>obj).animations;
                    if (!eleAnis) continue;
                    const objAnis = eleAnis.animationData;
                    for (const ani of objAnis) {
                        anis.push(new AnimationModel(ani.createProtocolObject()));
                    }
                    displayModel = new FramesModel({
                        id: obj.id,
                        sn: obj.sn,
                        animations: {
                            defaultAnimationName: eleAnis.defaultAnimationName,
                            display: eleAnis.display,
                            animationData: anis,
                        },
                    });
                    this.mModels.set(obj.id, displayModel);
                }
                const ele: IDisplayRef = {
                    id: obj.id,
                    displayModel,
                };
                this.mElementRef.set(obj.id, ele);
            }
        }

        this.updatePalette(config.root.palette);
        this.updateMoss(config.root.moss);
        this.updateAssets(config.root.assets);
    }

    public updatePalette(palette: PaletteNode) {
        for (const key of Array.from(palette.peersDict.keys())) {
            const terrainPalette = palette.peersDict.get(key) as TerrainNode;
            const terrainModel = this.terrainPalette.get(terrainPalette.id);
            if (!terrainModel) {
                const frameModel = new FramesModel({
                    id: terrainPalette.id,
                    sn: terrainPalette.sn,
                    animations: {
                        defaultAnimationName: terrainPalette.animations.defaultAnimationName,
                        display: terrainPalette.animations.display,
                        animationData: terrainPalette.animations.animationData.map(
                            (ani: AnimationDataNode) => new AnimationModel(ani.createProtocolObject())
                        ),
                    },
                });
                this.terrainPalette.set(key, frameModel);
                this.terrainPaletteWithBindId.set(terrainPalette.id, frameModel);
            }
        }
    }

    public updateMoss(moss: MossNode) {
        for (const peerKey of Array.from(moss.peersDict.keys())) {
            const elementMoss = moss.peersDict.get(peerKey) as ElementNode;
            const elementModel = this.mossPalette.get(elementMoss.id);
            if (!elementModel) {
                const frameModel = new FramesModel({
                    id: elementMoss.id,
                    sn: elementMoss.sn,
                    animations: {
                        defaultAnimationName: elementMoss.animations.defaultAnimationName,
                        display: elementMoss.animations.display,
                        animationData: elementMoss.animations.animationData.map(
                            (ani: AnimationDataNode) => new AnimationModel(ani.createProtocolObject())
                        ),
                    },
                });
                this.mossPalette.set(peerKey, { layer: elementMoss.layer, frameModel });
            }
        }
    }

    public updateAssets(assetsNode: AssetsNode) {
        const assets = assetsNode.getAssetList();
        this._assets = [];
        for (const asset of assets) {
            const media = asset.media;
            if (media) {
                const fileType = media.match(/\.([a-zA-Z0-9]+)($|\?)/);
                if (fileType && fileType[1]) {
                    this._assets.push({
                        type: fileType[1],
                        key: asset.key,
                        source: Url.getOsdRes(media),
                    });
                }
            }
        }
    }

    public setSceneConfig(config) {
        const objs = config.objectsList;
        let displayModel = null;
        // TODO Lite deserialize可能会有个别Display link失败
        for (const obj of objs) {
            if (obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.id);
                const eventName = [];
                obj.children.forEach((item) => {
                    if (item.className === "EventNode" && item.eventName === op_def.GameEvent.onElementHit) {
                        eventName.push(item.eventName);
                    }
                });
                if (!displayModel) {
                    const anis = [];
                    const eleAnis = (<ElementNode>obj).animations;
                    if (!eleAnis) continue;
                    const objAnis = eleAnis.animationData;
                    for (const ani of objAnis) {
                        anis.push(new AnimationModel(ani.createProtocolObject()));
                    }
                    displayModel = new FramesModel({
                        id: obj.id,
                        sn: obj.sn,
                        eventName,
                        animations: {
                            defaultAnimationName: eleAnis.defaultAnimationName,
                            display: eleAnis.display,
                            animationData: anis,
                        },
                    });
                    this.mModels.set(obj.id, displayModel);
                }
                const ele: IDisplayRef = {
                    id: obj.id,
                    name: obj.name,
                    displayModel,
                };
                this.mElementRef.set(obj.id, ele);
            }
        }

        const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;

        this._terrainCollection = sceneNode.terrainCollection;
        this._mossCollection = sceneNode.mossCollection;
        this._wallCollection = sceneNode.wallCollection;
        this._scenerys = sceneNode.getScenerys();
        // const scenerys = sceneNode.getScenerys();
        // this._scenerys = [];
        // for (const scenery of scenerys) {
        //     this._scenerys.push(scenery);
        // }
    }

    public add(obj: FramesModel | DragonbonesModel) {
        this.mModels.set(obj.id, obj);
    }

    public getElementRef(id) {
        return this.mElementRef.get(id);
    }

    public getDisplayModel(id: number): FramesModel | DragonbonesModel {
        const ele = this.mElementRef.get(id);
        if (ele) {
            return ele.displayModel;
        }
        Logger.getInstance().debugError(`can't find element ${id}`);
        return;
    }

    public getTerrainCollection() {
        return this._terrainCollection;
    }

    public getTerrainPalette(key: number) {
        if (this.terrainPalette.get(key)) {
            return this.terrainPalette.get(key);
        }
    }

    public getTerrainPaletteByBindId(id: number) {
        if (this.terrainPaletteWithBindId.get(id)) {
            return this.terrainPaletteWithBindId.get(id);
        }
    }

    public getMossCollection() {
        return this._mossCollection;
    }

    public getMossPalette(id: number) {
        if (this.mossPalette.get(id)) {
            return this.mossPalette.get(id);
        }
    }

    public getScenerys(): IScenery[] {
        return this._scenerys;
    }

    public getAssets(): IAsset[] {
        return this._assets;
    }

    public getWallCollection() {
        return this._wallCollection;
    }

    public destroy() {
        this.mElementRef.clear();

        this.terrainPalette.clear();
        this.terrainPaletteWithBindId.clear();
        this.mossPalette.clear();

        this.mModels.forEach((model, index) => {
            model.destroy();
        });

        this.mModels.clear();

        this._assets = undefined;
    }
}
