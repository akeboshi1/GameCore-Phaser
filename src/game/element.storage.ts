import { FramesModel, IFramesModel } from "../rooms/display/frames.model";
import { DragonbonesModel, IDragonbonesModel } from "../rooms/display/dragonbones.model";
import {
    Lite,
    ElementNode,
    SpawnPointNode,
    TerrainNode,
    PaletteNode,
    TerrainCollectionNode,
    SceneNode
} from "game-capsule";
import { Logger } from "../utils/log";
import { op_def } from "pixelpai_proto";
import { Animation } from "../rooms/display/animation";

export interface IElementStorage {
    setGameConfig(gameConfig: Lite);
    setSceneConfig(config: Lite)
    add(obj: IFramesModel | IDragonbonesModel): void;
    getObject(id: number): IFramesModel | IDragonbonesModel;
    getTerrainCollection();
    getPalette(id: number): IFramesModel;
    on(...args: any[])
    off(...args: any[])
}

interface IDisplayRef {
    // element id
    id: number;
    displayModel?: FramesModel | DragonbonesModel;
}

export class ElementStorage implements IElementStorage {
    private mModels = new Map<number, FramesModel | DragonbonesModel>();
    private mElementRef = new Map<number, IDisplayRef>();
    private mPaletteModels = new Map<number, FramesModel>();
    private _terrainCollection = new Map<number, TerrainCollectionNode>();

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

        for (const peer of config.root.palette.peers) {
            const { key, entity } = peer;
            const terrain = entity as TerrainNode;
            const terrainModel = this.mModels.get(entity.id);
            if (!terrainModel) {
                const frameModel = new FramesModel({
                    id: entity.id,
                    sn: entity.sn,
                    animations: {
                        defaultAnimationName: terrain.animations.defaultAnimationName,
                        display: terrain.animations.display,
                        animationData: terrain.animations.animationData.map((ani) => new Animation(ani))
                    }
                });
                this.mPaletteModels.set(entity.id, frameModel);
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
                            animationData: anis
                        }
                    });
                    this.mModels.set(obj.id, displayModel);
                }
                const ele: IDisplayRef = {
                    id: obj.id,
                    displayModel
                };
                this.mElementRef.set(obj.id, ele);
            }
        }

        for (const scene of config.root.children) {
            this._terrainCollection.set(scene.id, (scene as SceneNode).terrainCollection);
        }
    }

    public add(obj: FramesModel | DragonbonesModel) {
        this.mModels.set(obj.id, obj);
    }

    public getObject(id: number): FramesModel | DragonbonesModel {
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

    public getPalette(id: number) {
        return this.mPaletteModels.get(id);
    }

    // public loadGameConfig(paths: string[]): Promise<Lite> {
    //     const promises = [];
    //     for (const path of paths) {
    //         promises.push(load(ResUtils.getGameConfig(path), "arraybuffer"));
    //     }
    //     // TODO Promise.all如果其中有一个下载失败，会返回error
    //     return Promise.all(promises)
    //         .then((reqs: any[]) => {
    //             return this.decodeConfigs(reqs);
    //         });
    // }

    // private decodeConfigs(reqs: any[]): Promise<Lite> {
    //     return new Promise((resolve, reject) => {
    //         for (const req of reqs) {
    //             const arraybuffer = req.response;
    //             if (arraybuffer) {
    //                 try {
    //                     const gameConfig = new Lite();
    //                     gameConfig.deserialize(new Uint8Array(arraybuffer));
    //                     resolve(gameConfig);
    //                 } catch (error) {
    //                     reject(error);
    //                 }
    //             } else {
    //                 reject("error");
    //             }
    //         }
    //     });
    // }
}
