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
    EventNode
} from "game-capsule";
import { op_def } from "pixelpai_proto";
import { Url, BlockIndex } from "utils";
import { AnimationModel, IDragonbonesModel, IFramesModel, IPos, IScenery, Logger, LogicPos, Position45 } from "structure";
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
    getTerrainPalette(key: number): IFramesModel;
    getTerrainPaletteByBindId(id: number): IFramesModel;
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
    name?: string;
    pos?: IPos;
    direction?: number;
    blockIndex?: number;
    layer?: number;
    displayModel?: FramesModel | DragonbonesModel;
}

export class ElementStorage implements IElementStorage {
    protected mModels = new Map<number, FramesModel | DragonbonesModel>();
    protected mElementRef = new Map<number, IDisplayRef>();
    protected mTerrainRef = new Map<number, IDisplayRef>();
    protected mDisplayRefMap: Map<op_def.NodeType, Map<number, IDisplayRef>>;
    protected terrainPalette = new Map<number, FramesModel>();
    protected terrainPaletteWithBindId = new Map<number, FramesModel>();
    protected terrainPaletteWithSN = new Map<string, FramesModel>();
    protected mossPalette = new Map<number, { layer: number, frameModel: FramesModel }>();
    protected _terrainCollection: TerrainCollectionNode;
    protected _mossCollection: MossCollectionNode;
    protected _wallCollection: WallCollectionNode;
    protected _scenerys: IScenery[];
    protected _assets: IAsset[];

    // private event: Phaser.Events.EventEmitter;

    constructor() {
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
                    // this.mModels.set(obj.id, displayModel);
                }
                // const ele: IDisplayRef = {
                //     id: obj.id,
                //     displayModel,
                // };
                // this.mElementRef.set(obj.id, ele);
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
            if (!terrainPalette.animations) continue;
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
                this.terrainPaletteWithSN.set(terrainPalette.sn, frameModel);
            }
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
                        source: Url.getOsdRes(media),
                    });
                }
            }
        }
    }

    public setSceneConfig(config: Capsule) {
        this.clearDisplayRef();
        const objs = config.objectsList;
        const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;
        Logger.getInstance().log("sceneNode: ", sceneNode.size);
        if (!sceneNode) {
            return Logger.getInstance().error("Failed to parse scene, SceneNode does not exist");
        }
        // Logger.getInstance().log("children: ", children);
        let displayModel = null;
        // TODO Lite deserialize可能会有个别Display link失败
        for (const obj of objs) {
            if (obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.id);
                const eventName = [];
                obj.children.forEach((item) => {
                    // if (item.className === "EventNode" && item.eventName === op_def.GameEvent.onElementHit) {
                    //     eventName.push(item.eventName);
                    // }
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
                        const objAnis = eleAnis.animationData;
                        if (objAnis.length < 1) {
                            Logger.getInstance().error(`${obj.name}:${obj.id} animation error`);
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
                const eleRef: IDisplayRef = {
                    id: obj.id,
                    pos,
                    blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size),
                    direction: ele.animations.dir,
                    name: obj.name,
                    displayModel,
                    layer: ele.layer,
                };
                this.addDisplayRef(eleRef, op_def.NodeType.ElementNodeType);
            }
        }

        // const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;

        this._terrainCollection = sceneNode.terrainCollection;
        this._mossCollection = sceneNode.mossCollection;
        this._wallCollection = sceneNode.wallCollection;
        this._scenerys = sceneNode.getScenerys();
        // const scenerys = sceneNode.getScenerys();
        // this._scenerys = [];
        // for (const scenery of scenerys) {
        //     this._scenerys.push(scenery);
        // }
        this.addTerrainToDisplayRef(sceneNode);
        this.addMossToDisplayRef(sceneNode);
    }

    public add(obj: FramesModel | DragonbonesModel) {
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

    public getElementFromBlockIndex(indexs: number[], nodeType: op_def.NodeType) {
        const result = [];
        const map = this.mDisplayRefMap.get(nodeType);
        if (!map) return;
        map.forEach((ele) => {
            if (indexs.includes(ele.blockIndex)) result.push(ele);
        });
        return result;
    }

    public destroy() {
        this.clearDisplayRef();

        this.terrainPalette.clear();
        this.terrainPaletteWithBindId.clear();
        this.terrainPaletteWithSN.clear();
        this.mossPalette.clear();

        this.mModels.forEach((model, index) => {
            model.destroy();
        });

        this.mModels.clear();

        this._assets = undefined;
    }

    private addDisplayRef(displayRef: IDisplayRef, nodeType: op_def.NodeType) {
        const map = this.mDisplayRefMap.get(nodeType);
        if (!map) return;
        map.set(displayRef.id, displayRef);
    }

    private addTerrainToDisplayRef(sceneNode: SceneNode) {
        const terrains = this._terrainCollection.data;
        const cols = terrains.length;
        const rows = terrains[0].length;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (terrains[i][j] === 0) continue;
                const id = i << 16 | j;
                if (!sceneNode || !sceneNode.size) {
                    Logger.getInstance().error(`${sceneNode.name}-${sceneNode.id} sceneNode.size does not exist`);
                    continue;
                }
                const pos = Position45.transformTo90(new LogicPos(i, j), sceneNode.size);
                this.addDisplayRef({
                    id,
                    displayModel: this.getTerrainPalette(terrains[i][j]),
                    pos,
                    blockIndex: new BlockIndex().getBlockIndex(pos.x, pos.y, sceneNode.size)
                }, op_def.NodeType.TerrainNodeType);
            }
        }
    }

    private addMossToDisplayRef(sceneNode: SceneNode) {
        const mossCollection = this._mossCollection.data;
        for (const moss of mossCollection) {
            const mossPalette = this.getMossPalette(moss.key);
            const { layer, frameModel } = mossPalette;
            this.addDisplayRef({
                id: moss.id,
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
}
