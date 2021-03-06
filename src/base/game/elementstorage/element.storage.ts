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
    MossCollectionNode,
    Capsule,
    EventNode,
    GroundWalkableCollectionNode,
    AttributeNode,
} from "game-capsule";
import { op_def, op_gameconfig_01 } from "pixelpai_proto";
import { BlockIndex } from "utils";
import { AnimationModel, IDragonbonesModel, IFramesModel, IPos, IResPath, IScenery, Logger, LogicPos, ITilesetProperty } from "structure";
import { DragonbonesModel, FramesModel } from "../sprite";
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
    getTerrainPaletteBySN(sn: string): IFramesModel;
    getMossPalette(key: number): { layer: number, frameModel: FramesModel };
    getAssets(): IAsset[];
    getScenerys(): IScenery[];
    // on(event: string | symbol, fn: Function, context?: any);
    // off(event: string | symbol, fn: Function, context?: any);
    destroy();
}

export interface IDisplayRef {
    // element id
    id: number;
    sn?: string;
    name?: string;
    pos?: IPos;
    direction?: number;
    blockIndex?: number;
    layer?: number;
    displayModel?: FramesModel | DragonbonesModel;
    mountSprites?: number[];
    titleMask?: number;
    attrs?: op_gameconfig_01.IAttribute[];
}

export class ElementStorage implements IElementStorage {
    private mModels = new Map<number, FramesModel | DragonbonesModel>();
    private mElementRef = new Map<number, IDisplayRef>();
    private mDisplayRefMap: Map<op_def.NodeType, Map<number, IDisplayRef>>;
    private terrainPaletteWithSN = new Map<string, FramesModel>();
    private tilesetsSN2Idx: Map<string, number> = new Map<string, number>();
    private mossPalette = new Map<number, { layer: number, frameModel: FramesModel }>();
    private _terrainCollection: TerrainCollectionNode;
    private _mossCollection: MossCollectionNode;
    private _wallCollection: WallCollectionNode;
    private _groundWalkableCollection: GroundWalkableCollectionNode;
    private _scenerys: IScenery[];
    private _assets: IAsset[];

    // private event: Phaser.Events.EventEmitter;

    constructor(private config: IResPath) {
        // this.event = new Phaser.Events.EventEmitter();
        this.mDisplayRefMap = new Map();
        this.mDisplayRefMap.set(op_def.NodeType.ElementNodeType, new Map());
        this.mDisplayRefMap.set(op_def.NodeType.TerrainNodeType, new Map());
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

        this.updatePalette(config.root.palette);
        this.updateMoss(config.root.moss);
        this.updateAssets(config.root.assets);
    }

    public updatePalette(palette: PaletteNode) {
        for (const key of Array.from(palette.peersDict.keys())) {
            const terrainPalette = palette.peersDict.get(key) as TerrainNode;
            if (!terrainPalette.animations) continue;
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
            this.terrainPaletteWithSN.set(terrainPalette.sn, frameModel);
        }
    }

    public updateMoss(moss: MossNode) {
        for (const peerKey of Array.from(moss.peersDict.keys())) {
            const elementMoss = moss.peersDict.get(peerKey) as ElementNode;
            const elementModel = this.mossPalette.get(elementMoss.id);
            if (!elementMoss.animations) continue;
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
                        source: this.config.osdPath + media,
                    });
                }
            }
        }
    }

    public setSceneConfig(config: Capsule) {
        this.clearDisplayRef();
        const objs = config.objectsList;
        const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;
        if (!sceneNode) {
            return Logger.getInstance().error("Failed to parse scene, SceneNode does not exist");
        }
        let displayModel = null;
        for (const obj of objs) {
            if (obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.id);
                const eventName = [];
                obj.children.forEach((item) => {
                    if (item instanceof EventNode && item.eventName === op_def.GameEvent.onElementHit) {
                        eventName.push(item.eventName);
                    }
                });
                const ele = <ElementNode>obj;
                if (!displayModel) {
                    const anis = [];
                    const eleAnis = (<ElementNode>obj).animations;
                    if (ele.avatar) {
                        displayModel = new DragonbonesModel({ id: ele.id, avatar: ele.avatar.createProtocolObject() });
                    } else {
                        if (!eleAnis) {
                            Logger.getInstance().error(`${ele.sn}-${ele.name} missing animations`);
                            continue;
                        }
                        const objAnis = eleAnis.animationData;
                        if (objAnis.length < 1) {
                            Logger.getInstance().error(`${ele.sn}-${ele.name} missing animationData`);
                            continue;
                        }
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
                    }
                    this.mModels.set(obj.id, displayModel);
                }
                const pos = ele.location;
                if (!pos) {
                    Logger.getInstance().error(`${ele.name}-${ele.id} location does not exist`);
                    continue;
                }
                let mountSprites = null;
                if (ele.mountSprites && ele.mountSprites.ids.length > 0) {
                    mountSprites = ele.mountSprites.ids;
                }
                const attrNodes = <AttributeNode[]>ele.children.filter((child) => child.type === op_def.NodeType.AttributeType);
                const attrs = this.getAttr(attrNodes);
                let direction = 3;
                if (ele.animations) direction = ele.animations.dir;
                if (ele.avatar) direction = ele.avatar.dir;
                const eleRef: IDisplayRef = {
                    id: obj.id,
                    sn: obj.sn || displayModel.type,
                    pos,
                    blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size),
                    direction,
                    name: obj.name,
                    displayModel,
                    layer: ele.layer,
                    mountSprites,
                    attrs
                };
                this.addDisplayRef(eleRef, op_def.NodeType.ElementNodeType);
            }
        }

        // const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;

        this._terrainCollection = sceneNode.terrainCollection;
        this._mossCollection = sceneNode.mossCollection;
        this._wallCollection = sceneNode.wallCollection;
        this._groundWalkableCollection = sceneNode.groundWalkableCollection;
        this._scenerys = sceneNode.getScenerys();
        this.addMossToDisplayRef(sceneNode);
    }

    public add(obj: FramesModel | DragonbonesModel) {
        if (!obj) return;
        this.mModels.set(obj.id, obj);
    }

    public getElementRef(id) {
        const map = this.mDisplayRefMap.get(op_def.NodeType.ElementNodeType);
        if (!map) return;
        return map.get(id);
    }

    public getDisplayModel(id: number): FramesModel | DragonbonesModel {
        return this.mModels.get(id);
    }

    public getTerrainCollection() {
        return this._terrainCollection;
    }

    public getTerrainPaletteBySN(sn: string) {
        if (this.terrainPaletteWithSN.get(sn)) {
            return this.terrainPaletteWithSN.get(sn);
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

    public getGroundWalkableCollection() {
        return this._groundWalkableCollection;
    }

    public getTilesetIndexBySN(sn: string): number {
        if (sn === undefined || sn.length === 0 || !this.tilesetsSN2Idx.has(sn)) {
            return -1;
        }
        return this.tilesetsSN2Idx.get(sn);
    }

    public getElementFromBlockIndex(indexs: number[], nodeType: op_def.NodeType) {
        const result = [];
        const map = this.mDisplayRefMap.get(nodeType);
        if (!map) return;
        map.forEach((ele) => {
            if (indexs.includes(ele.blockIndex)) result.push(ele);
        });
        return result;
    }

    public updateTilesets(props: ITilesetProperty[]) {
        this.tilesetsSN2Idx.clear();
        for (const prop of props) {
            if (prop.sn === undefined || prop.sn.length === 0) {
                Logger.getInstance().warn("tileset data error: ", prop);
                continue;
            }

            this.tilesetsSN2Idx.set(prop.sn, prop.index);
        }
    }

    public destroy() {
        this.clearDisplayRef();

        this.terrainPaletteWithSN.clear();
        this.mossPalette.clear();
        this.tilesetsSN2Idx.clear();

        this.mModels.forEach((model, index) => {
            model.destroy();
        });

        this.mModels.clear();

        if (this._terrainCollection) {
            this._terrainCollection.destroy();
            this._terrainCollection = null;
        }
        if (this._mossCollection) {
            this._mossCollection.destroy();
            this._mossCollection = null;
        }
        if (this._wallCollection) {
            this._wallCollection.destroy();
            this._wallCollection = null;
        }
        if (this._groundWalkableCollection) {
            this._groundWalkableCollection.destroy();
            this._groundWalkableCollection = null;
        }
        this._scenerys = null;
        this._assets = undefined;
    }

    private addDisplayRef(displayRef: IDisplayRef, nodeType: op_def.NodeType) {
        const map = this.mDisplayRefMap.get(nodeType);
        if (!map) return;
        map.set(displayRef.id, displayRef);
    }

    private addMossToDisplayRef(sceneNode: SceneNode) {
        const mossCollection = this._mossCollection.data;
        for (const moss of mossCollection) {
            const mossPalette = this.getMossPalette(moss.key);
            if (!mossPalette) {
                Logger.getInstance().error("moss.id:" + moss.id + ";moss.key:" + moss.key + ",not exist");
                continue;
            }
            const { layer, frameModel } = mossPalette;
            this.addDisplayRef({
                id: moss.id,
                sn: frameModel.type,
                direction: moss.dir || 3,
                pos: new LogicPos(moss.x, moss.y, moss.z),
                displayModel: frameModel,
                layer,
                blockIndex: new BlockIndex().getBlockIndex(moss.x, moss.y, sceneNode.size)
            }, op_def.NodeType.ElementNodeType);
        }
    }

    private clearDisplayRef() {
        this.mDisplayRefMap.forEach((map) => map.clear());
    }

    private getAttr(attrs: AttributeNode[]): op_gameconfig_01.IAttribute[] {
        const result = [];
        for (const attr of attrs) {
            result.push(attr.createProtocolObject());
            // result.push({ key: attr.key, value: attr.basicTypeVal });
        }
        return result;
    }
}
