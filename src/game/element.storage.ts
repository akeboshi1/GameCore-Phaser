import { FramesModel, IFramesModel } from "../rooms/display/frames.model";
import { DragonbonesModel, IDragonbonesModel } from "../rooms/display/dragonbones.model";
import {
    Lite,
    ElementNode,
    SpawnPointNode,
    TerrainNode,
    PaletteNode,
    TerrainCollectionNode,
    SceneNode,
    AnimationDataNode,
    MossNode,
} from "game-capsule";
import { Logger } from "../utils/log";
import { op_def } from "pixelpai_proto";
import { Animation } from "../rooms/display/animation";
import { MossCollectionNode } from "game-capsule/lib/configobjects/scene";

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
    getMossPalette(key: number): IFramesModel;
    on(event: string | symbol, fn: Function, context?: any);
    off(event: string | symbol, fn: Function, context?: any);
}

interface IDisplayRef {
    // element id
    id: number;
    displayModel?: FramesModel | DragonbonesModel;
}

export class ElementStorage implements IElementStorage {
    private mModels = new Map<number, FramesModel | DragonbonesModel>();
    private mElementRef = new Map<number, IDisplayRef>();
    private terrainPalette = new Map<number, FramesModel>();
    private terrainPaletteWithBindId = new Map<number, FramesModel>();
    private mossPalette = new Map<number, FramesModel>();
    private _terrainCollection: TerrainCollectionNode;
    private _mossCollection: MossCollectionNode;

    private event: Phaser.Events.EventEmitter;

    constructor() {
        this.event = new Phaser.Events.EventEmitter();
    }

    public on(event: string | symbol, fn: Function, context?: any) {
        this.event.on(event, fn, context);
    }

    public off(event: string | symbol, fn: Function, context?: any) {
        this.event.off(event, fn, context);
    }

    public setGameConfig(config: Lite) {
        Logger.getInstance().log("TCL: ElementStorage -> config", config);
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
                    const objAnis = eleAnis.animationData;
                    for (const ani of objAnis) {
                        anis.push(new Animation(ani));
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
                            (ani: AnimationDataNode) => new Animation(ani)
                        ),
                    },
                });
                this.terrainPalette.set(key, frameModel);
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
                            (ani: AnimationDataNode) => new Animation(ani)
                        ),
                    },
                });
                this.mossPalette.set(peerKey, frameModel);
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
                if (!displayModel) {
                    const anis = [];
                    const eleAnis = (<ElementNode>obj).animations;
                    const objAnis = eleAnis.animationData;
                    for (const ani of objAnis) {
                        anis.push(new Animation(ani));
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

        const sceneNode = config.root.children.find((node) => node.type === op_def.NodeType.SceneNodeType) as SceneNode;

        this._terrainCollection = sceneNode.terrainCollection;
        this._mossCollection = sceneNode.mossCollection;
    }

    public add(obj: FramesModel | DragonbonesModel) {
        this.mModels.set(obj.id, obj);
    }

    public getDisplayModel(id: number): FramesModel | DragonbonesModel {
        const ele = this.mElementRef.get(id);
        if (ele) {
            return ele.displayModel;
        }
        // Logger.getInstance().error(`can't find element ${id}`);
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
}
